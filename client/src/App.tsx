import './App.css'
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from 'react-hook-form';
import { z } from "zod"
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Define todo interface
interface Todo {
  id: number;
  val: string;
  isDone: boolean;
}

// Define form schema with Zod
const todoSchema = z.object({
  task: z.string()
    .min(2, { message: "Task must be at least 2 characters long" })
    .max(100, { message: "Task cannot exceed 100 characters" })
    .trim()
});

// Infer type from schema
type TodoFormValues = z.infer<typeof todoSchema>;


function App() {
  // const [inputVal, setInputVal] = useState("");
  const [todos, setTodos] = useState<Todo[]>(() => {
    const savedTodos = localStorage.getItem("todos");
    return savedTodos ? JSON.parse(savedTodos) : [];
  });

  const [isEdited, setIsEdited] = useState(false);
  const [editedId, setEditedId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const { toast } = useToast();

  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      task: "",
    },
  });

    // Save todos to localStorage whenever they change
    useEffect(() => {
      localStorage.setItem('todos', JSON.stringify(todos));
    }, [todos]);


    const onSubmit = async (values: TodoFormValues) => {
      setIsSubmitting(true);

      try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (!isEdited) {
        setTodos([
          ...todos,
          { val: values.task, isDone: false, id: new Date().getTime() }
        ]);
        toast({
          title: "Success",
          description: "Task added successfully",
          duration: 2000,
        });

      } else {
        setTodos([
          ...todos.filter(todo => todo.id !== editedId),
          { val: values.task, isDone: false, id: editedId || new Date().getTime() }
        ]);

        toast({
          title: "Success",
          description: "Task updated successfully",
          duration: 2000,
        });

        setIsEdited(false);
        setEditedId(null);
      }
      form.reset();

      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Something went wrong. Please try again.",
          duration: 3000,
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    const onError = (errors: any) => {
      const firstError = Object.values(errors)[0] as { message: string };
      if (firstError) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: firstError.message,
          duration: 3000,
        });
      }
    };
  
  const onDelete = async (id: number) => {
    setLoadingId(id);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setTodos(todos.filter((todo) => todo.id !== id));

      toast({
        variant: "destructive",
        title: "Success",
        description: "Task deleted successfully",
        duration: 2000,
      });

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete task",
        duration: 3000,
      });
    } finally {
      setLoadingId(null);
    }
  };

  const handleDone = async (id: number) => {
    setLoadingId(id);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTodos(todos.map((todo) => {
        if (todo.id === id) {
          const newStatus = !todo.isDone;
          toast({
            title: newStatus ? "Task Completed" : "Task Reopened",
            description: newStatus ? "Task marked as done" : "Task marked as not done",
            duration: 2000,
          });
          return { ...todo, isDone: newStatus };
        }
        return todo;
      }));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update task status",
        duration: 3000,
      });
    } finally {
      setLoadingId(null);
    }
  };

  const handleEdit = async (id: number) => {
    setLoadingId(id);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const todoToEdit = todos.find((todo) => todo.id === id);
      if (todoToEdit) {
        form.setValue('task', todoToEdit.val);
        setEditedId(todoToEdit.id);
        setIsEdited(true);
        toast({
          title: "Edit Mode",
          description: "You can now edit your task",
          duration: 2000,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to enter edit mode",
        duration: 3000,
      });
    } finally {
      setLoadingId(null);
    }
  };

  const handleClearAll = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTodos([]);
      localStorage.removeItem('todos');
      form.reset();
      setIsEdited(false);
      setEditedId(null);
      toast({
        title: "All Clear",
        description: "All tasks have been removed",
        duration: 2000,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to clear tasks",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-3xl py-12 mx-auto">
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-center">To Do List</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onError)} className="flex items-end gap-4 mb-8">
            <FormField 
              control={form.control}
              name='task'
              render={({ field }) => (
                <FormItem className='flex-1'>
                  <FormLabel>Task</FormLabel>
                  <FormControl>
                    <Input
                        type="text"
                        placeholder="Type your task and press Enter"
                        disabled={isSubmitting}
                        {...field}
                      />
                  </FormControl>
                </FormItem>
              )}
            >
            </FormField>

            <Button
            variant={isEdited ? "outline" : "default"}
            className="min-w-[100px]"
            disabled={isSubmitting}
            type='submit'
            
          >
            {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isEdited ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  isEdited ? 'Edit Task' : 'Add Task'
                )}
          </Button>

          <Button 
          variant="outline" 
          onClick={handleClearAll}
          className="text-sm"
          disabled={todos.length === 0 || isSubmitting}
        >
          {/* {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  'Clear All'
                )} */}
                Clear All
        </Button>

        </form>
        </Form>

        <div className='space-y-4'>
          {todos.length === 0 && (
            <p className="text-sm text-center text-muted-foreground">
              No tasks yet. Add a task to get started.
            </p>
          )}
        </div>

        <div className="space-y-4">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center gap-4 p-4 border rounded-lg"
            >
              <Checkbox
                checked={todo.isDone}
                onCheckedChange={() => handleDone(todo.id)}
                disabled={loadingId === todo.id}
              />
              
              <span className={`flex-1 ${todo.isDone ? 'text-green-600 line-through' : ''}`}>
                {todo.val}
              </span>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => handleDone(todo.id)}
                  disabled={loadingId === todo.id}
                >
                    {loadingId === todo.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      todo.isDone ? "Undo" : "Done"
                    )}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleEdit(todo.id)}
                  disabled={loadingId === todo.id}
                >
                    {loadingId === todo.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Edit"
                    )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => onDelete(todo.id)}
                  disabled={loadingId === todo.id}
                >
                  {loadingId === todo.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Delete"
                    )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
  )
}

export default App
