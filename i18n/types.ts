export type TranslationKeys = {
  common: {
    navigation: {
      home: string;
      dashboard: string;
      library: string;
      documents: string;
      recommendations: string;
      applications: string;
      profile: string;
      settings: string;
      logout: string;
      features: string;
      products: string;
      pricing: string;
      contact: string;
      platform: string;
      api: string;
      analytics: string;
      signIn: string;
      getStarted: string;
      signUp: string;
      help: string;
      support: string;
      language: string;
      account: string;
      menu: string;
    };
    sidebar: {
      overview: string;
      taskManagement: string;
      scholarships: string;
      savedScholarships: string;
      schoolsPrograms: string;
      applications: string;
      applicationManagement: string;
      recommendations: string;
      recipients: string;
      documents: string;
      documentLibrary: string;
      edduraSquads: string;
      quickActions: string;
      takeQuiz: string;
      viewResults: string;
    };
    actions: {
      save: string;
      cancel: string;
      delete: string;
      edit: string;
      create: string;
      view: string;
      copy: string;
      clone: string;
      download: string;
      upload: string;
      import: string;
      export: string;
      search: string;
      filter: string;
      sort: string;
      clear: string;
      submit: string;
      continue: string;
      back: string;
      next: string;
      previous: string;
      close: string;
      open: string;
      refresh: string;
      reload: string;
      retry: string;
      confirm: string;
      apply: string;
      reset: string;
      restore: string;
      duplicate: string;
      share: string;
      print: string;
      preview: string;
    };
    status: {
      loading: string;
      loadingDocuments: string;
      loadingData: string;
      error: string;
      success: string;
      failed: string;
      completed: string;
      pending: string;
      active: string;
      inactive: string;
      draft: string;
      published: string;
    };
    labels: {
      title: string;
      description: string;
      category: string;
      type: string;
      tags: string;
      author: string;
      date: string;
      created: string;
      updated: string;
      words: string;
      characters: string;
      pages: string;
      results: string;
      total: string;
      available: string;
      selected: string;
      name: string;
      firstName: string;
      lastName: string;
      fullName: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      country: string;
      language: string;
      timezone: string;
      currency: string;
      status: string;
      priority: string;
      deadline: string;
      progress: string;
      completion: string;
    };
    messages: {
      noData: string;
      noResults: string;
      tryAgain: string;
      somethingWentWrong: string;
      confirmDelete: string;
      unsavedChanges: string;
      welcome: string;
      goodbye: string;
      thankYou: string;
      pleaseWait: string;
      almostDone: string;
      getStarted: string;
      learnMore: string;
      readMore: string;
      showMore: string;
      showLess: string;
      seeAll: string;
      viewAll: string;
      hideDetails: string;
      showDetails: string;
      expand: string;
      collapse: string;
      minimize: string;
      maximize: string;
      fullscreen: string;
      exitFullscreen: string;
      today: string;
      yesterday: string;
      tomorrow: string;
      thisWeek: string;
      lastWeek: string;
      nextWeek: string;
      thisMonth: string;
      lastMonth: string;
      nextMonth: string;
      thisYear: string;
      lastYear: string;
      nextYear: string;
      processing: string;
      letsGo: string;
      awesome: string;
      excellent: string;
      perfect: string;
      oops: string;
      finish: string;
      skip: string;
      academic: string;
      scholarship: string;
      application: string;
      university: string;
      program: string;
      degree: string;
      transcript: string;
      recommendation: string;
      essay: string;
      statement: string;
      portfolio: string;
      deadline: string;
      requirement: string;
      eligibility: string;
      admission: string;
    };
  };
  pages: {
    dashboard: {
      title: string;
      subtitle: string;
      welcome: string;
      personalizedExperience: string;
      loadingDashboard: string;
      preparingExperience: string;
      stats: {
        applicationPackages: string;
        documentsCreated: string;
        recommendationLetters: string;
        scholarshipsSaved: string;
        tokensEarned: string;
        created: string;
        requestedReceived: string;
        shownInterest: string;
        total: string;
      };
      quickActions: {
        title: string;
        subtitle: string;
        takeQuiz: string;
        retakeQuiz: string;
        discoverStrengths: string;
        updatePreferences: string;
        viewResults: string;
        seeRecommendations: string;
        applyNow: string;
        startApplications: string;
        browseScholarships: string;
        findFunding: string;
      };
      recentActivity: {
        title: string;
        subtitle: string;
        noActivity: string;
        activitiesWillAppear: string;
        showLess: string;
        loadMore: string;
        justNow: string;
        minutesAgo: string;
        hoursAgo: string;
        daysAgo: string;
      };
      profile: {
        editProfile: string;
        viewProfile: string;
        quizCompleted: string;
        quizNotCompleted: string;
        memberSince: string;
        lastLogin: string;
        location: string;
        phoneNumber: string;
        dateOfBirth: string;
      };
    };
    recommendations: {
      title: string;
      subtitle: string;
      stats: {
        totalRecipients: string;
        activeRequests: string;
        completedRequests: string;
        responseRate: string;
        inYourNetwork: string;
        pending: string;
        completed: string;
        averageRate: string;
      };
      search: {
        placeholder: string;
        filterByInstitution: string;
        filterByPreference: string;
        allInstitutions: string;
        allPreferences: string;
        prefersDrafts: string;
        prefersEmail: string;
        prefersPhone: string;
      };
      recipient: {
        addNew: string;
        edit: string;
        delete: string;
        contact: string;
        viewProfile: string;
        sendRequest: string;
        copyEmail: string;
        callPhone: string;
        prefersDrafts: string;
        prefersEmail: string;
        prefersPhone: string;
        department: string;
        institution: string;
        primaryEmail: string;
        phoneNumber: string;
        officeAddress: string;
        addedOn: string;
        lastUpdated: string;
      };
      empty: {
        title: string;
        description: string;
        addFirst: string;
      };
      actions: {
        addRecipient: string;
        editRecipient: string;
        deleteRecipient: string;
        confirmDelete: string;
        deleteWarning: string;
      };
    };
    library: {
      title: string;
      subtitle: string;
      stats: {
        availableDocuments: string;
        myClonedDocuments: string;
        favoriteCategory: string;
        documentsRated: string;
        inLibrary: string;
        thisWeek: string;
        mostCloned: string;
        reviewsGiven: string;
      };
      quickActions: {
        title: string;
        myClonedDocuments: {
          title: string;
          description: string;
          action: string;
        };
        myDocuments: {
          title: string;
          description: string;
          action: string;
        };
        applicationManagement: {
          title: string;
          description: string;
          action: string;
        };
      };
      search: {
        title: string;
        placeholder: string;
        noResults: string;
        noResultsDescription: string;
        clearFilters: string;
        createYourOwn: string;
      };
      documents: {
        title: string;
        cloned: string;
        views: string;
        clones: string;
        rating: string;
        previewDocument: string;
        cloneDocument: string;
        rateDocument: string;
        downloadPDF: string;
        downloadDOCX: string;
        alreadyCloned: string;
        cloning: string;
        viewMore: string;
      };
      categories: {
        personal: string;
        professional: string;
        academic: string;
        experience: string;
        reference: string;
      };
    };
    taskManagement: {
      title: string;
      subtitle: string;
      loading: string;
      loadingSubtitle: string;
      stats: {
        totalApplications: string;
        activeApplications: string;
        overdueTasks: string;
        upcomingDeadlines: string;
        applicationTypes: string;
        applicationStatus: string;
      };
      applicationTypes: {
        schools: string;
        programs: string;
        scholarships: string;
      };
      status: {
        draft: string;
        inProgress: string;
        submitted: string;
        underReview: string;
        approved: string;
        rejected: string;
        waitlisted: string;
        withdrawn: string;
        unknown: string;
      };
      actions: {
        addTask: string;
        addApplication: string;
        continueApplication: string;
        viewApplication: string;
        searchApplications: string;
        filterByStatus: string;
        allStatus: string;
      };
      labels: {
        started: string;
        lastActivity: string;
        minutesRemaining: string; // expects {count}
      };
      pagination: {
        showing: string; // expects {from}, {to}, {total}
        pageSize: string;
        perPage: string; // expects {count}
      };
      overview: {
        title: string;
        averageProgress: string;
        applicationsInProgress: string;
      };
      empty: {
        title: string;
        description: string;
        browseScholarships: string;
      };
    };
    scholarships: {
      title: string;
      subtitle: string;
    };
    savedScholarships: {
      title: string;
      subtitle: string;
      search: string;
      filterByStatus: string;
      allStatus: string;
      status: {
        saved: string;
        interested: string;
        applied: string;
        notInterested: string;
      };
      actions: {
        viewDetails: string;
        editScholarship: string;
        updateScholarship: string;
        removeScholarship: string;
      };
      empty: {
        title: string;
        noResults: string;
        getStarted: string;
        browseScholarships: string;
      };
      deadline: {
        expired: string;
        today: string;
        tomorrow: string;
        daysLeft: string;
      };
      dialog: {
        editTitle: string;
        editDescription: string;
        status: string;
        notes: string;
        notesPlaceholder: string;
        cancel: string;
        update: string;
      };
      notifications: {
        removed: string;
        updated: string;
        linkCopied: string;
        linkCopiedDescription: string;
        linkCopyFailed: string;
        linkCopyFailedDescription: string;
      };
    };
    documents: {
      title: string;
      subtitle: string;
      stats: {
        totalDocuments: string;
        activeDocuments: string;
        totalWords: string;
        categories: string;
        inYourLibrary: string;
        active: string;
        wordsWritten: string;
        documentTypes: string;
      };
      categories: {
        title: string;
        all: string;
        personal: string;
        professional: string;
        academic: string;
        experience: string;
        reference: string;
        upload: string;
      };
      empty: {
        title: string;
        description: string;
        createFirst: string;
        importExisting: string;
      };
      categoryEmpty: {
        title: string;
        description: string;
        create: string;
      };
      quickActions: {
        title: string;
        description: string;
        browseTemplates: string;
        createNew: string;
      };
    };
  };
  forms: {
    validation: {
      required: string;
      email: string;
      minLength: string;
      maxLength: string;
      minWords: string;
      maxWords: string;
      invalidFormat: string;
      passwordMismatch: string;
      passwordMinLength: string;
      passwordComplexity: string;
      confirmPassword: string;
      invalidDate: string;
      invalidNumber: string;
      positiveNumber: string;
      invalidPhoneNumber: string;
      invalidUrl: string;
      selectAtLeastOne: string;
      fieldRequired: string;
      tooShort: string;
      tooLong: string;
    };
    placeholders: {
      enterTitle: string;
      enterDescription: string;
      searchDocuments: string;
      selectCategory: string;
      selectType: string;
      enterTags: string;
    };
  };
  notifications: {
    success: {
      documentCreated: string;
      documentUpdated: string;
      documentDeleted: string;
      documentCloned: string;
      ratingSubmitted: string;
      downloadComplete: string;
      changesSaved: string;
      recipientAdded: string;
      recipientUpdated: string;
      recipientDeleted: string;
      copiedToClipboard: string;
    };
    error: {
      documentCreateFailed: string;
      documentUpdateFailed: string;
      documentDeleteFailed: string;
      documentCloneFailed: string;
      ratingFailed: string;
      downloadFailed: string;
      fetchFailed: string;
      networkError: string;
      invalidFile: string;
      emptyFile: string;
      recipientDeleteFailed: string;
    };
    loading: {
      generatingPDF: string;
      generatingDOCX: string;
      loadingDocuments: string;
      cloningDocument: string;
      savingChanges: string;
    };
  };
};

export type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TranslationKey = NestedKeyOf<TranslationKeys>;