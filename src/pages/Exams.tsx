import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Assignment } from '@/types/Assignments';

const Exams = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const fetchAssignments = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('profile_id', user.id);

      if (error) throw error;

      // Type assertion to ensure data matches Assignment type
      const typedAssignments = data.map(assignment => ({
        id: assignment.id,
        profile_id: assignment.profile_id,
        name: assignment.name,
        course: assignment.course,
        type: assignment.type,
        due_date: assignment.due_date,
        status: assignment.status,
        completed: assignment.completed,
        created_at: assignment.created_at,
        updated_at: assignment.updated_at
      }));

      setAssignments(typedAssignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch assignments',
        variant: 'destructive'
      });
    }
  }, [user, toast]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  return (
    <div>
      <h1>Exams and Assignments</h1>
      {assignments.map((assignment) => (
        <div key={assignment.id}>
          <h2>{assignment.name}</h2>
          <p>Course: {assignment.course}</p>
          <p>Type: {assignment.type}</p>
          <p>Due Date: {assignment.due_date}</p>
          <p>Status: {assignment.status}</p>
          <p>Completed: {assignment.completed ? 'Yes' : 'No'}</p>
        </div>
      ))}
    </div>
  );
};

export default Exams;
