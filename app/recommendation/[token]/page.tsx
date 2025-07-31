'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, Calendar, Building, FileText, CheckCircle, AlertCircle, Upload, Download, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface RecommendationRequest {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  status: string;
  includeDraft: boolean;
  draftContent?: string;
  relationshipContext?: string;
  additionalContext?: string;
  studentId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  recipientId: {
    name: string;
    email: string;
    title: string;
    institution: string;
    department?: string;
  };
  applicationId?: {
    title: string;
  };
  scholarshipId?: {
    title: string;
  };
}

interface RecommendationLetter {
  _id: string;
  content?: string;
  fileName?: string;
  fileUrl?: string;
  submittedAt: string;
  version: number;
}

export default function RecipientPortalPage() {
  const params = useParams();
  const token = params.token as string;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [request, setRequest] = useState<RecommendationRequest | null>(null);
  const [existingLetter, setExistingLetter] = useState<RecommendationLetter | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRequest();
  }, [token]);

  const fetchRequest = async () => {
    try {
      const response = await fetch(`/api/recommendations/recipient/${token}`);
      const data = await response.json();
      
      if (response.ok) {
        setRequest(data.request);
        setExistingLetter(data.existingLetter);
      } else {
        setError(data.error || 'Failed to load request');
      }
    } catch (error) {
      console.error('Error fetching request:', error);
      setError('Failed to load request');
    } finally {
      setLoading(false);
    }
  };

  const validateAndSetFile = (file: File) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return false;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return false;
    }
    
    setSelectedFile(file);
    return true;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('Please select a document to upload');
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);
    
    try {
      // Step 1: Get presigned URL for upload
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile);
      
      console.log('Preparing upload for file:', selectedFile.name, 'Size:', selectedFile.size, 'Type:', selectedFile.type);
      
      const uploadResponse = await fetch(`/api/recommendations/recipient/${token}/upload`, {
        method: 'POST',
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.json();
        console.error('Upload preparation failed:', uploadResponse.status, uploadError);
        toast.error(uploadError.error || 'Failed to prepare file upload');
        return;
      }

      let uploadData = await uploadResponse.json();
      console.log('Upload data received:', uploadData);
      
      // Step 2: Upload file directly to S3
      setUploadProgress(25);
      console.log('Uploading to S3 with presigned URL:', uploadData.presignedUrl);
      console.log('File details:', {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type
      });
      
      // Validate presigned URL
      if (!uploadData.presignedUrl || !uploadData.presignedUrl.startsWith('https://')) {
        console.error('Invalid presigned URL:', uploadData.presignedUrl);
        toast.error('Invalid upload URL received from server');
        return;
      }
      
      // Log the full presigned URL for debugging
      console.log('Full presigned URL:', uploadData.presignedUrl);
      console.log('URL length:', uploadData.presignedUrl.length);
      
      // Test URL validity
      try {
        const urlTest = new URL(uploadData.presignedUrl);
        console.log('URL validation passed:', {
          protocol: urlTest.protocol,
          hostname: urlTest.hostname,
          pathname: urlTest.pathname,
          search: urlTest.search
        });
      } catch (urlError) {
        console.error('Invalid URL format:', urlError);
        toast.error('Invalid upload URL format received from server');
        return;
      }
      
      // Enhanced error handling and debugging
      let s3Upload: Response;
      let uploadSuccessful = false;
      
      try {
        console.log('Starting fetch request to S3...');
        
        // Approach 1: Direct fetch with File object and minimal headers
        try {
          console.log('Trying Approach 1: Direct fetch with File object');
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
          
          s3Upload = await fetch(uploadData.presignedUrl, {
            method: 'PUT',
            body: selectedFile,
            headers: {
              'Content-Type': selectedFile.type,
            },
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          console.log('Approach 1 successful');
          uploadSuccessful = true;
        } catch (error1: unknown) {
          console.log('Approach 1 failed:', error1 instanceof Error ? error1.message : 'Unknown error');
          console.log('Error type:', error1 instanceof Error ? error1.constructor.name : 'Unknown');
          
          // Approach 2: Convert File to Blob with no additional headers
          try {
            console.log('Trying Approach 2: Convert File to Blob');
            const fileBlob = new Blob([selectedFile], { type: selectedFile.type });
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
            
            s3Upload = await fetch(uploadData.presignedUrl, {
              method: 'PUT',
              body: fileBlob,
              signal: controller.signal,
              // Remove Content-Type header to let browser set it automatically
            });
            
            clearTimeout(timeoutId);
            console.log('Approach 2 successful');
            uploadSuccessful = true;
          } catch (error2: unknown) {
            console.log('Approach 2 failed:', error2 instanceof Error ? error2.message : 'Unknown error');
            console.log('Error type:', error2 instanceof Error ? error2.constructor.name : 'Unknown');
            
            // Approach 3: Read file as ArrayBuffer with explicit Content-Type
            try {
              console.log('Trying Approach 3: Read file as ArrayBuffer');
              const arrayBuffer = await selectedFile.arrayBuffer();
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
              
              s3Upload = await fetch(uploadData.presignedUrl, {
                method: 'PUT',
                body: arrayBuffer,
                headers: {
                  'Content-Type': selectedFile.type,
                },
                signal: controller.signal,
              });
              
              clearTimeout(timeoutId);
              console.log('Approach 3 successful');
              uploadSuccessful = true;
            } catch (error3: unknown) {
              console.log('Approach 3 failed:', error3 instanceof Error ? error3.message : 'Unknown error');
              console.log('Error type:', error3 instanceof Error ? error3.constructor.name : 'Unknown');
              
              // Approach 4: Try without any headers
              try {
                console.log('Trying Approach 4: No headers');
                const arrayBuffer = await selectedFile.arrayBuffer();
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
                
                s3Upload = await fetch(uploadData.presignedUrl, {
                  method: 'PUT',
                  body: arrayBuffer,
                  signal: controller.signal,
                });
                
                clearTimeout(timeoutId);
                console.log('Approach 4 successful');
                uploadSuccessful = true;
              } catch (error4: unknown) {
                console.log('Approach 4 failed:', error4 instanceof Error ? error4.message : 'Unknown error');
                console.log('Error type:', error4 instanceof Error ? error4.constructor.name : 'Unknown');
                throw error4; // Re-throw the last error
              }
            }
          }
        }

        if (uploadSuccessful) {
          console.log('S3 upload response:', s3Upload.status, s3Upload.statusText);
          console.log('S3 upload headers:', Object.fromEntries(s3Upload.headers.entries()));
          
          if (!s3Upload.ok) {
            const s3ErrorText = await s3Upload.text();
            console.error('S3 upload failed:', s3Upload.status, s3ErrorText);
            toast.error(`Failed to upload file to storage: ${s3Upload.status} ${s3Upload.statusText}`);
            return;
          }
        }
      } catch (s3Error: unknown) {
        console.error('S3 upload fetch error:', s3Error);
        console.error('Error details:', {
          message: s3Error instanceof Error ? s3Error.message : 'Unknown error',
          name: s3Error instanceof Error ? s3Error.name : 'Unknown',
          stack: s3Error instanceof Error ? s3Error.stack : undefined
        });
        
        // Check for specific error types
        if (s3Error instanceof TypeError && s3Error.message.includes('fetch')) {
          toast.error('Network error: Unable to connect to storage service. Please check your internet connection.');
        } else if (s3Error instanceof Error && s3Error.message.includes('CORS')) {
          toast.error('CORS error: Unable to upload file due to browser security restrictions.');
        } else if (s3Error instanceof Error && s3Error.name === 'AbortError') {
          toast.error('Upload timeout: The request took too long to complete. Please try again.');
        } else {
          toast.error(`Failed to upload file to storage: ${s3Error instanceof Error ? s3Error.message : 'Unknown error'}`);
        }
        
        // Try fallback: server-side upload
        console.log('Attempting fallback: server-side upload');
        try {
          const fallbackFormData = new FormData();
          fallbackFormData.append('file', selectedFile);
          fallbackFormData.append('token', token);
          
          const fallbackResponse = await fetch(`/api/recommendations/recipient/${token}/upload-fallback`, {
            method: 'POST',
            body: fallbackFormData,
          });
          
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            console.log('Fallback upload successful:', fallbackData);
            
            // Continue with submission using fallback data
            uploadData = fallbackData;
            uploadSuccessful = true;
          } else {
            const fallbackError = await fallbackResponse.text();
            console.error('Fallback upload failed:', fallbackError);
            toast.error('All upload methods failed. Please try again later.');
            return;
          }
        } catch (fallbackError) {
          console.error('Fallback upload error:', fallbackError);
          toast.error('All upload methods failed. Please try again later.');
          return;
        }
      }

      setUploadProgress(75);

      // Step 3: Submit the recommendation letter with file metadata
      console.log('Submitting recommendation with file metadata:', {
        fileName: uploadData.filename,
        fileUrl: uploadData.fileUrl,
        fileType: uploadData.fileType,
        fileSize: uploadData.fileSize,
        originalName: uploadData.originalName,
      });
      
      const submitResponse = await fetch(`/api/recommendations/recipient/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: uploadData.filename,
          fileUrl: uploadData.fileUrl,
          fileType: uploadData.fileType,
          fileSize: uploadData.fileSize,
          originalName: uploadData.originalName,
        }),
      });

      const submitData = await submitResponse.json();
      console.log('Submit response:', submitResponse.status, submitData);
      
      if (submitResponse.ok) {
        toast.success('Recommendation letter submitted successfully!');
        setSelectedFile(null);
        setUploadProgress(100);
        // Refresh the request to show updated status
        fetchRequest();
      } else {
        console.error('Submit failed:', submitResponse.status, submitData);
        toast.error(submitData.error || 'Failed to submit letter');
      }
    } catch (error) {
      console.error('Error submitting letter:', error);
      toast.error(`Failed to submit letter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading recommendation request...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Request Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            This link may have expired or the request may have been cancelled.
          </p>
        </div>
      </div>
    );
  }

  if (!request) {
    return null;
  }

  const daysUntilDeadline = getDaysUntilDeadline(request.deadline);
  const isOverdue = daysUntilDeadline < 0;
  const isReceived = request.status === 'received';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Recommendation Letter Request
          </h1>
          <p className="text-gray-600">
            {request.studentId.firstName} {request.studentId.lastName} has requested a recommendation letter
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Main Content */}
          <div className="lg:col-span-4 space-y-6">
            {/* Request Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Request Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Request Title</Label>
                  <p className="text-lg font-medium">{request.title}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Description</Label>
                  <p className="text-gray-600 whitespace-pre-wrap">{request.description}</p>
                </div>

                {request.relationshipContext && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Student's Relationship with You</Label>
                    <p className="text-gray-600">{request.relationshipContext}</p>
                  </div>
                )}

                {request.additionalContext && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Additional Context</Label>
                    <p className="text-gray-600 whitespace-pre-wrap">{request.additionalContext}</p>
                  </div>
                )}

                {request.applicationId && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Application</Label>
                    <p className="text-gray-600">{request.applicationId.title}</p>
                  </div>
                )}

                {request.scholarshipId && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Scholarship</Label>
                    <p className="text-gray-600">{request.scholarshipId.title}</p>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Deadline</Label>
                    <p className="text-gray-600">{format(new Date(request.deadline), 'PPP')}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Status</Label>
                    <Badge 
                      variant={isReceived ? 'default' : isOverdue ? 'destructive' : 'secondary'}
                      className="ml-2"
                    >
                      {isReceived ? 'Received' : isOverdue ? 'Overdue' : 'Pending'}
                    </Badge>
                  </div>
                </div>

                {!isReceived && (
                  <Alert variant={isOverdue ? 'destructive' : 'default'}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {isOverdue 
                        ? `This request is ${Math.abs(daysUntilDeadline)} days overdue.`
                        : `This request is due in ${daysUntilDeadline} days.`
                      }
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Letter Submission */}
            {!isReceived ? (
              <Card>
                <CardHeader>
                  <CardTitle>Recommendation Letter Upload</CardTitle>
                  <CardDescription>
                    Upload your recommendation letter as a PDF or Word document. This should include your letterhead and signature.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="file-upload">Upload Document *</Label>
                        <div className="mt-2">
                          <div 
                            className={`flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors ${
                              isDragOver 
                                ? 'border-blue-400 bg-blue-50' 
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                          >
                            <div className="space-y-2 text-center">
                              <Upload className={`mx-auto h-12 w-12 ${isDragOver ? 'text-blue-400' : 'text-gray-400'}`} />
                              <div className="flex text-sm text-gray-600">
                                <label
                                  htmlFor="file-upload"
                                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                >
                                  <span>Upload a file</span>
                                  <input
                                    id="file-upload"
                                    name="file-upload"
                                    type="file"
                                    className="sr-only"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleFileSelect}
                                  />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                              </div>
                              <p className="text-xs text-gray-500">
                                PDF, DOC, or DOCX up to 10MB
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {selectedFile && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="text-sm font-medium text-blue-900">{selectedFile.name}</p>
                                <p className="text-xs text-blue-700">
                                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedFile(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {uploadProgress > 0 && (
                        <div className="space-y-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-600">
                            {uploadProgress < 25 && 'Preparing upload...'}
                            {uploadProgress >= 25 && uploadProgress < 75 && 'Uploading to secure storage...'}
                            {uploadProgress >= 75 && uploadProgress < 100 && 'Submitting recommendation...'}
                            {uploadProgress >= 100 && 'Complete!'}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSelectedFile(null)}
                        disabled={!selectedFile}
                      >
                        Clear
                      </Button>
                      <Button type="submit" disabled={submitting || !selectedFile}>
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          'Submit Letter'
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Letter Submitted
                  </CardTitle>
                  <CardDescription>
                    This recommendation letter has been submitted successfully.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Submitted Document</Label>
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {existingLetter?.fileName || 'Recommendation Letter'}
                        </p>
                        <p className="text-xs text-gray-600">
                          Submitted on {existingLetter?.submittedAt ? format(new Date(existingLetter.submittedAt), 'PPP') : 'Unknown date'}
                        </p>
                      </div>
                      {existingLetter?.fileUrl && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(existingLetter.fileUrl, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            {/* Student Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Name</Label>
                  <p className="text-gray-900">
                    {request.studentId.firstName} {request.studentId.lastName}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Email</Label>
                  <p className="text-gray-600">{request.studentId.email}</p>
                </div>
              </CardContent>
            </Card>

            {/* Your Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Name</Label>
                  <p className="text-gray-900">{request.recipientId.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Title</Label>
                  <p className="text-gray-600">{request.recipientId.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Institution</Label>
                  <p className="text-gray-600">{request.recipientId.institution}</p>
                </div>
                {request.recipientId.department && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Department</Label>
                    <p className="text-gray-600">{request.recipientId.department}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Student Context */}
            {/* {(request.relationshipContext || request.additionalContext) && (
              <Card>
                <CardHeader>
                  <CardTitle>Student Context</CardTitle>
                  <CardDescription>
                    Information provided by the student to help you write the recommendation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {request.relationshipContext && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Relationship with You</Label>
                      <p className="text-sm text-gray-600 mt-1">{request.relationshipContext}</p>
                    </div>
                  )}
                  
                  {request.additionalContext && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Additional Context</Label>
                      <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{request.additionalContext}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )} */}

            {/* Draft Information */}
            {request.includeDraft && request.draftContent && (
              <Card>
                <CardHeader>
                  <CardTitle>Student Draft</CardTitle>
                  <CardDescription>
                    The student has provided a draft for your reference
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">
                      This is a draft provided by the student. You may use it as a starting point or write your own letter.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // For now, we'll just show a message since we're using file upload
                        toast.info('Please upload your recommendation letter as a document');
                      }}
                    >
                      View Draft
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Deadline Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Deadline Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Due Date</Label>
                  <p className="text-gray-900">{format(new Date(request.deadline), 'PPP')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Time Remaining</Label>
                  <p className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                    {isOverdue 
                      ? `${Math.abs(daysUntilDeadline)} days overdue`
                      : `${daysUntilDeadline} days remaining`
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}