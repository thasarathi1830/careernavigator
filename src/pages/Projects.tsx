
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, FileText, Plus, Search, Filter } from "lucide-react";

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock project data
  const projects = [
    {
      id: 1,
      title: "Smart Campus Navigation System",
      description: "An AI-powered mobile app for campus navigation with accessibility features",
      status: "In Progress",
      deadline: "2025-06-15",
      team: ["John Doe", "Sarah Johnson", "David Chen"],
      mentor: "Dr. Emily Carter",
      tags: ["React Native", "TensorFlow", "Google Maps API"],
    },
    {
      id: 2,
      title: "Student Health Analysis Dashboard",
      description: "Data visualization tool to track student health and wellness metrics",
      status: "Completed",
      deadline: "2025-03-10",
      team: ["John Doe", "Michael Brown"],
      mentor: "Prof. Robert Wilson",
      tags: ["React", "D3.js", "Node.js"],
    },
    {
      id: 3,
      title: "Blockchain-based Academic Records",
      description: "Secure system for storing and verifying academic credentials using blockchain",
      status: "Planning",
      deadline: "2025-08-01",
      team: ["John Doe"],
      mentor: "Dr. Lisa Zhang",
      tags: ["Solidity", "Ethereum", "Web3.js"],
    },
  ];
  
  // Mock research projects
  const researchProjects = [
    {
      id: 1,
      title: "Machine Learning for Early Disease Detection",
      description: "Using machine learning algorithms to identify patterns in medical data that may indicate early signs of disease",
      department: "Computer Science",
      faculty: "Dr. James Wilson",
      status: "Open",
      positions: 2,
      requirements: ["Strong programming skills in Python", "Knowledge of machine learning algorithms", "Interest in healthcare applications"],
    },
    {
      id: 2,
      title: "Sustainable Urban Development Modeling",
      description: "Creating computational models to simulate and evaluate sustainable urban development strategies",
      department: "Environmental Engineering",
      faculty: "Dr. Olivia Martinez",
      status: "Open",
      positions: 3,
      requirements: ["Experience with simulation software", "Interest in urban planning or environmental science", "Data analysis skills"],
    },
    {
      id: 3,
      title: "Quantum Computing Algorithms",
      description: "Developing and testing novel algorithms for quantum computers with applications in cryptography",
      department: "Physics & Computer Science",
      faculty: "Dr. Thomas Lee",
      status: "Open",
      positions: 1,
      requirements: ["Strong mathematical background", "Understanding of quantum mechanics principles", "Programming experience"],
    },
  ];
  
  // Filter projects based on search query
  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Filter research projects based on search query
  const filteredResearch = researchProjects.filter(research =>
    research.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    research.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    research.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Projects & Research</h1>

      <Tabs defaultValue="myprojects">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="myprojects">My Projects</TabsTrigger>
          <TabsTrigger value="research">Research Opportunities</TabsTrigger>
          <TabsTrigger value="create">Create Project</TabsTrigger>
        </TabsList>

        <TabsContent value="myprojects">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-grow relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                className="pl-10"
                placeholder="Search projects by title, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="inprogress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Filter size={18} /> Filter
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {filteredProjects.map((project) => (
              <Card key={project.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold">{project.title}</h3>
                    <Badge
                      className={`${
                        project.status === "Completed"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : project.status === "In Progress"
                          ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                          : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                      }`}
                    >
                      {project.status}
                    </Badge>
                  </div>

                  <p className="text-gray-700 mt-2">{project.description}</p>

                  <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Deadline: {new Date(project.deadline).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="h-4 w-4 mr-1"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      Team: {project.team.length} members
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="h-4 w-4 mr-1"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                        />
                      </svg>
                      Mentor: {project.mentor}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {project.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-education-light text-education-primary"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" /> Documents
                    </Button>
                    <Button className="bg-education-primary hover:bg-education-primary/90">
                      View Project
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredProjects.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No projects found</h3>
                <p className="text-gray-500 mt-1">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="research">
          <div className="flex flex-col md:flex-row justify-between mb-6">
            <h2 className="text-xl font-semibold mb-4 md:mb-0">Research Opportunities</h2>
            <div className="flex gap-2">
              <Input
                className="w-[240px]"
                placeholder="Search research projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="cs">Computer Science</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="physics">Physics</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-6">
            {filteredResearch.map((research) => (
              <Card key={research.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold">{research.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {research.department} • Faculty: {research.faculty}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      {research.positions} Position{research.positions > 1 ? "s" : ""} Available
                    </Badge>
                  </div>

                  <p className="text-gray-700 mt-3">{research.description}</p>

                  <div className="mt-4">
                    <h4 className="font-medium text-sm mb-2">Requirements:</h4>
                    <ul className="list-disc pl-5 text-gray-600 space-y-1 text-sm">
                      {research.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button className="bg-education-primary hover:bg-education-primary/90">
                      Apply for Position
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredResearch.length === 0 && (
              <div className="text-center py-12">
                <svg
                  className="h-12 w-12 mx-auto text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium">No research opportunities found</h3>
                <p className="text-gray-500 mt-1">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="create">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-6">Create New Project</h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="project-title">Project Title</Label>
                      <Input id="project-title" placeholder="Enter project title" className="bg-white" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="project-description">Project Description</Label>
                      <textarea
                        id="project-description"
                        rows={4}
                        className="w-full border rounded-md p-2 bg-white resize-none"
                        placeholder="Describe your project idea..."
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="project-type">Project Type</Label>
                      <Select>
                        <SelectTrigger id="project-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="academic">Academic Project</SelectItem>
                          <SelectItem value="research">Research Project</SelectItem>
                          <SelectItem value="personal">Personal Project</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="deadline">Deadline</Label>
                      <Input id="deadline" type="date" className="bg-white" />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="block mb-2">Project Tags</Label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge className="bg-education-light text-education-primary px-3 py-1 flex items-center gap-1">
                        React <span className="cursor-pointer">×</span>
                      </Badge>
                      <Badge className="bg-education-light text-education-primary px-3 py-1 flex items-center gap-1">
                        Machine Learning <span className="cursor-pointer">×</span>
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder="Add new tag" className="bg-white" />
                      <Button className="bg-education-primary hover:bg-education-primary/90">Add</Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="block mb-2">Team Members</Label>
                    <div className="mb-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md mb-2">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-education-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                            JD
                          </div>
                          <div>
                            <p className="font-medium">John Doe</p>
                            <p className="text-xs text-gray-500">john.doe@example.com</p>
                          </div>
                        </div>
                        <Badge>Project Lead</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder="Add team member by email" className="bg-white" />
                      <Button className="bg-education-primary hover:bg-education-primary/90">
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="mentor" className="block mb-2">Faculty Mentor</Label>
                    <Select>
                      <SelectTrigger id="mentor">
                        <SelectValue placeholder="Select a faculty mentor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dr-emily-carter">Dr. Emily Carter</SelectItem>
                        <SelectItem value="prof-robert-wilson">Prof. Robert Wilson</SelectItem>
                        <SelectItem value="dr-lisa-zhang">Dr. Lisa Zhang</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <Button variant="outline">Save as Draft</Button>
                    <Button className="bg-education-primary hover:bg-education-primary/90">Create Project</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Project Resources</h2>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium mb-1 text-education-primary">Project Templates</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Download templates for project proposals and reports
                    </p>
                    <Button variant="outline" size="sm" className="w-full border-education-primary text-education-primary">
                      Browse Templates
                    </Button>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium mb-1 text-education-primary">Find Team Members</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Connect with other students looking for projects
                    </p>
                    <Button variant="outline" size="sm" className="w-full border-education-primary text-education-primary">
                      Student Directory
                    </Button>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium mb-1 text-education-primary">Project Management</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Tools to help you manage your project effectively
                    </p>
                    <Button variant="outline" size="sm" className="w-full border-education-primary text-education-primary">
                      View Resources
                    </Button>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Projects by Department</h3>
                  <ul className="space-y-1 text-sm">
                    <li className="flex justify-between">
                      <span>Computer Science</span>
                      <span className="text-education-primary">48 projects</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Engineering</span>
                      <span className="text-education-primary">36 projects</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Business & Economics</span>
                      <span className="text-education-primary">24 projects</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Arts & Humanities</span>
                      <span className="text-education-primary">18 projects</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Health Sciences</span>
                      <span className="text-education-primary">32 projects</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Projects;
