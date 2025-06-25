import React, { useState } from "react";

interface School {
  id: string;
  name: string;
}

export default function TestSchoolMap() {
  const [schools, setSchools] = useState<School[]>([
    { id: "1", name: "Test School" },
    { id: "2", name: "Another School" },
  ]);

  return (
    <div>
      {schools.map((school) => (
        <div key={school.id}>{school.name}</div>
      ))}
    </div>
  );
} 