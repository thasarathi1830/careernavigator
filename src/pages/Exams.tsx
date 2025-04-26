
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Assignment } from '@/types/Assignments';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Save, Plus } from "lucide-react";

const Exams = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Assignment>>({});

  const fetchAssignments = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('profile_id', user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;

      setAssignments(data || []);
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

  const handleEdit = (assignment: Assignment) => {
    setEditingId(assignment.id);
    setEditForm(assignment);
  };

  const handleUpdate = async () => {
    if (!editingId || !user) return;

    try {
      const { error } = await supabase
        .from('assignments')
        .update({
          name: editForm.name,
          course: editForm.course,
          type: editForm.type,
          due_date: editForm.due_date,
          status: editForm.status
        })
        .eq('id', editingId)
        .select();

      if (error) throw error;

      setEditingId(null);
      setEditForm({});
      fetchAssignments();
      
      toast({
        title: 'Success',
        description: 'Assignment updated successfully'
      });
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update assignment',
        variant: 'destructive'
      });
    }
  };

  const handleAdd = async () => {
    if (!user) return;
    
    try {
      const newAssignment = {
        profile_id: user.id,
        name: 'New Assignment',
        course: '',
        type: 'Assignment',
        due_date: new Date().toISOString().split('T')[0],
        status: 'Pending',
        completed: false
      };

      const { error } = await supabase
        .from('assignments')
        .insert(newAssignment)
        .select();

      if (error) throw error;

      fetchAssignments();
      toast({
        title: 'Success',
        description: 'New assignment added'
      });
    } catch (error) {
      console.error('Error adding assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add assignment',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Exams and Assignments</h1>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add New
        </Button>
      </div>
      
      <Card className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell>
                  {editingId === assignment.id ? (
                    <Input
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  ) : (
                    assignment.name
                  )}
                </TableCell>
                <TableCell>
                  {editingId === assignment.id ? (
                    <Input
                      value={editForm.course || ''}
                      onChange={(e) => setEditForm({ ...editForm, course: e.target.value })}
                    />
                  ) : (
                    assignment.course
                  )}
                </TableCell>
                <TableCell>
                  {editingId === assignment.id ? (
                    <Input
                      value={editForm.type || ''}
                      onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    />
                  ) : (
                    assignment.type
                  )}
                </TableCell>
                <TableCell>
                  {editingId === assignment.id ? (
                    <Input
                      type="date"
                      value={editForm.due_date?.split('T')[0] || ''}
                      onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                    />
                  ) : (
                    new Date(assignment.due_date).toLocaleDateString()
                  )}
                </TableCell>
                <TableCell>
                  {editingId === assignment.id ? (
                    <Input
                      value={editForm.status || ''}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    />
                  ) : (
                    assignment.status
                  )}
                </TableCell>
                <TableCell>
                  {editingId === assignment.id ? (
                    <Button size="sm" onClick={handleUpdate}>
                      <Save className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(assignment)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Exams;
