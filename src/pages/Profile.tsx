
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const [editMode, setEditMode] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Student profile state
  const [studentProfile, setStudentProfile] = useState({
    id: "S12345",
    name: "John Doe",
    email: user?.email || "john.doe@university.edu",
    phone: "+1 (555) 123-4567",
    dob: "1998-06-15",
    address: "123 Campus Drive, University City, CA 94102",
    major: "Computer Science",
    year: "Junior",
    gpa: 3.75,
    bio: "Enthusiastic computer science student with a passion for AI and machine learning. Looking for internship opportunities in software development.",
    skills: ["JavaScript", "Python", "React", "Node.js", "Machine Learning"],
  });

  // New skill input state
  const [newSkill, setNewSkill] = useState("");

  // Load profile data if user is logged in
  useEffect(() => {
    if (user) {
      // If you have a profiles table connected to the user, you could fetch additional profile data here
      setStudentProfile(prev => ({
        ...prev,
        email: user.email || prev.email,
        name: user.user_metadata?.full_name || prev.name
      }));
    }
  }, [user]);

  const handleSaveProfile = () => {
    // Here you would typically save the profile to your database
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
    setEditMode(false);
  };

  const handleAddSkill = () => {
    if (newSkill.trim() !== "" && !studentProfile.skills.includes(newSkill)) {
      setStudentProfile({
        ...studentProfile,
        skills: [...studentProfile.skills, newSkill],
      });
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setStudentProfile({
      ...studentProfile,
      skills: studentProfile.skills.filter(skill => skill !== skillToRemove),
    });
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setStudentProfile({
      ...studentProfile,
      [id]: value,
    });
  };

  return (
    <div className="container py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Student Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <div className="relative mb-4 group">
                <Avatar className="h-32 w-32">
                  <AvatarImage src="" alt={studentProfile.name} />
                  <AvatarFallback className="text-3xl bg-education-primary text-white">
                    {studentProfile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="text-white text-sm">Change Photo</span>
                </div>
              </div>
              <h2 className="text-xl font-bold">{studentProfile.name}</h2>
              <p className="text-gray-500 text-sm mb-4">{studentProfile.id}</p>
              <div className="text-center mb-6">
                <div className="text-sm font-medium text-gray-700">
                  {studentProfile.major}
                </div>
                <div className="text-sm text-gray-500">{studentProfile.year} Year</div>
              </div>
              <div className="w-full">
                <Button
                  className="w-full mb-3"
                  onClick={() => editMode ? handleSaveProfile() : setEditMode(true)}
                >
                  {editMode ? "Save Profile" : "Edit Profile"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-education-primary text-education-primary hover:bg-education-light"
                >
                  Download Resume
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3">
          <Tabs defaultValue="info">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="info">Basic Info</TabsTrigger>
              <TabsTrigger value="academic">Academic</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="certifications">Certifications</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      {editMode ? (
                        <Input
                          id="name"
                          value={studentProfile.name}
                          onChange={handleInputChange}
                          className="bg-white"
                        />
                      ) : (
                        <div className="text-gray-700 py-2">{studentProfile.name}</div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      {editMode ? (
                        <Input
                          id="email"
                          type="email"
                          value={studentProfile.email}
                          onChange={handleInputChange}
                          className="bg-white"
                          disabled={!!user} // Disable if connected to auth user
                        />
                      ) : (
                        <div className="text-gray-700 py-2">{studentProfile.email}</div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      {editMode ? (
                        <Input
                          id="phone"
                          value={studentProfile.phone}
                          onChange={handleInputChange}
                          className="bg-white"
                        />
                      ) : (
                        <div className="text-gray-700 py-2">{studentProfile.phone}</div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth</Label>
                      {editMode ? (
                        <Input
                          id="dob"
                          type="date"
                          value={studentProfile.dob}
                          onChange={handleInputChange}
                          className="bg-white"
                        />
                      ) : (
                        <div className="text-gray-700 py-2">
                          {new Date(studentProfile.dob).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      {editMode ? (
                        <Input
                          id="address"
                          value={studentProfile.address}
                          onChange={handleInputChange}
                          className="bg-white"
                        />
                      ) : (
                        <div className="text-gray-700 py-2">
                          {studentProfile.address}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bio">Bio</Label>
                      {editMode ? (
                        <Textarea
                          id="bio"
                          rows={4}
                          value={studentProfile.bio}
                          onChange={handleInputChange}
                          className="resize-none bg-white"
                        />
                      ) : (
                        <div className="text-gray-700 py-2">{studentProfile.bio}</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Skills</h3>
                    {editMode && (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add new skill"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          className="w-48"
                          onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAddSkill}
                          className="text-education-primary border-education-primary"
                        >
                          Add
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {studentProfile.skills.map((skill, index) => (
                      <div
                        key={index}
                        className="bg-education-light text-education-primary px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {skill}
                        {editMode && (
                          <button 
                            className="ml-2 text-education-danger hover:text-red-600"
                            onClick={() => handleRemoveSkill(skill)}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="academic">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-6">Academic Information</h3>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Current Status</h4>
                      <div className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                        Active
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Major</p>
                        <p className="font-medium">{student.major}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Year</p>
                        <p className="font-medium">{student.year}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">GPA</p>
                        <p className="font-medium">{student.gpa}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-medium mb-4">Recent Courses</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Course Code
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Course Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Credits
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Grade
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              CS301
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              Database Systems
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              3
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                A
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              CS350
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              Web Development
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              4
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                A-
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              CS430
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              Machine Learning
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              4
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                B+
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="projects">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium">Projects & Research</h3>
                    <Button className="bg-education-primary hover:bg-education-primary/90">
                      Add New Project
                    </Button>
                  </div>

                  <div className="space-y-6">
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-medium">
                            Smart Campus Navigation System
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            An AI-powered mobile app for campus navigation with accessibility features
                          </p>
                        </div>
                        <div className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-medium">
                          In Progress
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          React Native
                        </div>
                        <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          Tensorflow
                        </div>
                        <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          Google Maps API
                        </div>
                      </div>

                      <div className="mt-4 flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          Deadline: June 15, 2025
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-education-primary border-education-primary"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-medium">
                            Student Health Analysis Dashboard
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            Data visualization tool to track student health and wellness metrics
                          </p>
                        </div>
                        <div className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                          Completed
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          React
                        </div>
                        <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          D3.js
                        </div>
                        <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          Node.js
                        </div>
                      </div>

                      <div className="mt-4 flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          Completed: March 10, 2025
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-education-primary border-education-primary"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="certifications">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium">Certifications</h3>
                    <Button className="bg-education-primary hover:bg-education-primary/90">
                      Add Certification
                    </Button>
                  </div>

                  <div className="space-y-6">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-education-light rounded-md text-education-primary">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-8 h-8"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">AWS Certified Solutions Architect</h4>
                          <p className="text-sm text-gray-500 mt-1">Amazon Web Services</p>
                          <div className="flex justify-between mt-2">
                            <span className="text-sm text-gray-500">
                              Issued: Jan 2025 • Expires: Jan 2028
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-education-primary border-education-primary"
                            >
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-education-light rounded-md text-education-primary">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-8 h-8"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">Machine Learning Specialization</h4>
                          <p className="text-sm text-gray-500 mt-1">Stanford University & Coursera</p>
                          <div className="flex justify-between mt-2">
                            <span className="text-sm text-gray-500">
                              Issued: Nov 2024
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-education-primary border-education-primary"
                            >
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
