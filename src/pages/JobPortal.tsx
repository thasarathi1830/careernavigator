
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, Calendar, Building, Search, Filter } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const JobPortal = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  
  const jobs = [
    {
      id: 1,
      title: "Software Engineer Intern",
      company: "TechCorp",
      location: "San Francisco, CA (Remote)",
      type: "Internship",
      deadline: "2025-05-15",
      posted: "2 days ago",
      description:
        "Join our engineering team to build cutting-edge web applications using React, Node.js, and AWS. You'll work directly with senior engineers on real projects.",
      requirements: [
        "Currently pursuing a degree in Computer Science or related field",
        "Experience with JavaScript, HTML, CSS",
        "Knowledge of React or similar frameworks",
        "Strong problem-solving skills",
      ],
      tags: ["React", "Node.js", "AWS", "JavaScript"],
      applied: false,
    },
    {
      id: 2,
      title: "Data Science Intern",
      company: "DataInsight",
      location: "Boston, MA (Hybrid)",
      type: "Internship",
      deadline: "2025-05-20",
      posted: "1 week ago",
      description:
        "Work with our data science team to analyze large datasets, build machine learning models, and create visualizations. This role offers exposure to real-world data problems.",
      requirements: [
        "Currently pursuing a degree in Computer Science, Statistics, or related field",
        "Experience with Python, R, or similar",
        "Knowledge of machine learning concepts",
        "Strong analytical skills",
      ],
      tags: ["Python", "Machine Learning", "Data Analysis", "Statistics"],
      applied: true,
    },
    {
      id: 3,
      title: "Full Stack Developer",
      company: "Innovatech",
      location: "New York, NY (On-site)",
      type: "Full-time",
      deadline: "2025-06-01",
      posted: "2 weeks ago",
      description:
        "Join our growing team to build and maintain web applications for enterprise clients. You'll be involved in all aspects of development from database design to frontend implementation.",
      requirements: [
        "Bachelor's degree in Computer Science or related field",
        "2+ years of experience in web development",
        "Proficiency in JavaScript, React, and Node.js",
        "Experience with SQL and NoSQL databases",
      ],
      tags: ["React", "Node.js", "MongoDB", "Express", "TypeScript"],
      applied: false,
    },
    {
      id: 4,
      title: "UX/UI Design Intern",
      company: "DesignHub",
      location: "Seattle, WA (Remote)",
      type: "Internship",
      deadline: "2025-05-25",
      posted: "3 days ago",
      description:
        "Work with our design team to create beautiful, user-friendly interfaces for web and mobile applications. You'll gain hands-on experience with the entire design process.",
      requirements: [
        "Currently pursuing a degree in Design, HCI, or related field",
        "Proficiency with design tools like Figma or Adobe XD",
        "Understanding of UX principles",
        "Portfolio demonstrating UI/UX projects",
      ],
      tags: ["UI", "UX", "Figma", "Design Systems"],
      applied: false,
    },
    {
      id: 5,
      title: "Machine Learning Engineer",
      company: "AI Solutions",
      location: "Austin, TX (Hybrid)",
      type: "Full-time",
      deadline: "2025-06-15",
      posted: "1 week ago",
      description:
        "Join our AI team to develop and deploy machine learning models for real-world applications. You'll work on challenging problems in computer vision and natural language processing.",
      requirements: [
        "Master's or Bachelor's degree in Computer Science or related field",
        "Strong understanding of machine learning algorithms",
        "Experience with Python and ML frameworks like TensorFlow or PyTorch",
        "Knowledge of deep learning concepts",
      ],
      tags: ["Python", "TensorFlow", "PyTorch", "Deep Learning"],
      applied: false,
    },
  ];

  const applications = jobs.filter(job => job.applied);

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="container py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Job & Internship Portal</h1>

      <Tabs defaultValue="browse">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="browse">Browse Opportunities</TabsTrigger>
          <TabsTrigger value="applications">My Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="browse">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-grow relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                className="pl-10"
                placeholder="Search jobs, companies, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="fulltime">Full Time</SelectItem>
                  <SelectItem value="parttime">Part Time</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Filter size={18} /> Filter
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <Card key={job.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-semibold text-education-dark">{job.title}</h2>
                          <div className="flex items-center text-gray-500 mt-1">
                            <Building className="h-4 w-4 mr-1" />
                            <span className="text-sm">{job.company}</span>
                          </div>
                        </div>
                        <Badge variant={job.type === "Internship" ? "outline" : "default"}>
                          {job.type}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Deadline: {new Date(job.deadline).toLocaleDateString()}
                        </div>
                        <div>Posted: {job.posted}</div>
                      </div>

                      <p className="mt-4 text-gray-600">{job.description}</p>

                      <div className="mt-4">
                        <h3 className="font-medium mb-2">Requirements:</h3>
                        <ul className="list-disc pl-5 text-gray-600 space-y-1">
                          {job.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {job.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="bg-education-light text-education-primary">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex justify-end mt-6 gap-3">
                        <Button variant="outline">Save for Later</Button>
                        <Button
                          disabled={job.applied}
                          className="bg-education-primary hover:bg-education-primary/90"
                        >
                          {job.applied ? "Applied" : "Apply Now"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No jobs found</h3>
                <p className="text-gray-500 mt-1">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="applications">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">My Applications</h2>
              
              {applications.length > 0 ? (
                <div className="space-y-6">
                  {applications.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{job.title}</h3>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Building className="h-4 w-4 mr-1" />
                            <span>{job.company}</span>
                          </div>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                          In Review
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location}
                        </div>
                        <div>Applied: April 18, 2025</div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <div className="text-sm">
                          <span className="font-medium">Application Status:</span> Under review by hiring manager
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Briefcase className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium">No applications yet</h3>
                  <p className="text-gray-500 mt-1">Browse jobs and start applying</p>
                  <Button className="mt-4 bg-education-primary hover:bg-education-primary/90">
                    Browse Jobs
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JobPortal;
