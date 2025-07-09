import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ThumbsUp, AlertTriangle, Heart, CheckSquare, Plus, Users, RotateCcw, Star, TrendingUp, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";

const COLUMNS = {
  "went_well": { 
    title: "What went well?", 
    icon: ThumbsUp, 
    bgColor: "bg-green-50 dark:bg-green-900/20", 
    borderColor: "border-green-200 dark:border-green-800",
    iconColor: "text-green-600 dark:text-green-400"
  },
  "to_improve": { 
    title: "What could be improved?", 
    icon: AlertTriangle, 
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20", 
    borderColor: "border-yellow-200 dark:border-yellow-800",
    iconColor: "text-yellow-600 dark:text-yellow-400"
  },
  "action_items": { 
    title: "Action items", 
    icon: CheckSquare, 
    bgColor: "bg-blue-50 dark:bg-blue-900/20", 
    borderColor: "border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-600 dark:text-blue-400"
  },
  "appreciations": { 
    title: "Appreciations", 
    icon: Heart, 
    bgColor: "bg-pink-50 dark:bg-pink-900/20", 
    borderColor: "border-pink-200 dark:border-pink-800",
    iconColor: "text-pink-600 dark:text-pink-400"
  }
};

export default function Retrospective() {
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [selectedBoard, setSelectedBoard] = useState<number | null>(null);
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({ category: "", content: "", authorName: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    toast({
      title: "Unauthorized",
      description: "You are logged out. Logging in again...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2">Loading...</div>
          <div className="text-gray-600">Please wait while we load your retrospective data</div>
        </div>
      </div>
    );
  }

  const { data: teams } = useQuery({
    queryKey: ["/api/teams"],
  });

  const { data: boards } = useQuery({
    queryKey: ["/api/teams", selectedTeam, "retrospective-boards"],
    queryFn: async () => {
      if (!selectedTeam) return [];
      const response = await apiRequest("GET", `/api/teams/${selectedTeam}/retrospective-boards`);
      return response.json();
    },
    enabled: !!selectedTeam,
  });

  const { data: items } = useQuery({
    queryKey: ["/api/retrospective-boards", selectedBoard, "items"],
    queryFn: async () => {
      if (!selectedBoard) return [];
      const response = await apiRequest("GET", `/api/retrospective-boards/${selectedBoard}/items`);
      return response.json();
    },
    enabled: !!selectedBoard,
  });

  const createBoardMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", `/api/teams/${selectedTeam}/retrospective-boards`, data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams", selectedTeam, "retrospective-boards"] });
      setIsCreatingBoard(false);
      // Auto-select the newly created board
      if (data && data.id) {
        setSelectedBoard(data.id);
      }
      toast({
        title: "Success",
        description: "Retrospective board created successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create retrospective board",
        variant: "destructive",
      });
    },
  });

  const addItemMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", `/api/retrospective-boards/${selectedBoard}/items`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/retrospective-boards", selectedBoard, "items"] });
      setIsAddingItem(false);
      setNewItem({ category: "", content: "", authorName: "" });
      toast({
        title: "Success",
        description: "Feedback item added successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add feedback item",
        variant: "destructive",
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await apiRequest("DELETE", `/api/retrospective-items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/retrospective-boards", selectedBoard, "items"] });
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    },
  });

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTeam) {
      toast({
        title: "Error",
        description: "Please select a team first",
        variant: "destructive",
      });
      return;
    }
    
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const sprintNumber = formData.get("sprintNumber") as string;
    
    if (!sprintNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a sprint number",
        variant: "destructive",
      });
      return;
    }
    
    createBoardMutation.mutate({
      sprintNumber,
      title: `Sprint ${sprintNumber} Retrospective`,
      status: "active",
    });
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newItem.category || !newItem.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    addItemMutation.mutate({
      type: newItem.category,
      content: newItem.content,
      authorName: newItem.authorName || "Anonymous",
    });
  };

  const groupedItems = items?.reduce((acc: any, item: any) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {}) || {};

  if (!teams?.length) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Teams Found</h2>
          <p className="text-gray-600 mb-4">You need to create a team first to run retrospectives.</p>
          <Button>Create Your First Team</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Sprint Retrospectives</h1>
          <p className="text-gray-600 dark:text-gray-400">Reflect on your sprint and plan improvements</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Dialog open={isCreatingBoard} onOpenChange={setIsCreatingBoard}>
            <DialogTrigger asChild>
              <Button disabled={!selectedTeam}>
                <Plus className="w-4 h-4 mr-2" />
                New Retrospective
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Retrospective Board</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateBoard} className="space-y-4">
                <div>
                  <Label htmlFor="sprintNumber">Sprint Number</Label>
                  <Input name="sprintNumber" placeholder="e.g., S03" required />
                </div>
                <Button type="submit" className="w-full" disabled={createBoardMutation.isPending}>
                  {createBoardMutation.isPending ? "Creating..." : "Create Retrospective"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Team and Board Selection */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <Label htmlFor="team-select">Select Team</Label>
          <Select 
            value={selectedTeam?.toString() || ""} 
            onValueChange={(value) => {
              setSelectedTeam(parseInt(value));
              setSelectedBoard(null); // Reset board selection when team changes
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a team" />
            </SelectTrigger>
            <SelectContent>
              {teams?.map((team: any) => (
                <SelectItem key={team.id} value={team.id.toString()}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Label htmlFor="board-select">Select Retrospective</Label>
          <Select 
            value={selectedBoard?.toString() || ""} 
            onValueChange={(value) => setSelectedBoard(parseInt(value))}
            disabled={!selectedTeam}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a retrospective" />
            </SelectTrigger>
            <SelectContent>
              {boards?.map((board: any) => (
                <SelectItem key={board.id} value={board.id.toString()}>
                  {board.title} ({board.sprintNumber})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedBoard && (
        <div className="space-y-6">
          {/* Add Item Button */}
          <div className="flex justify-end">
            <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Feedback
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Feedback Item</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddItem} className="space-y-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newItem.category} onValueChange={(value) => setNewItem(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="went_well">What went well?</SelectItem>
                        <SelectItem value="to_improve">What could be improved?</SelectItem>
                        <SelectItem value="action_items">Action items</SelectItem>
                        <SelectItem value="appreciations">Appreciations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="content">Feedback</Label>
                    <Textarea 
                      placeholder="Enter your feedback..."
                      value={newItem.content}
                      onChange={(e) => setNewItem(prev => ({ ...prev, content: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="authorName">Your Name (Optional)</Label>
                    <Input 
                      placeholder="Enter your name or leave blank for anonymous"
                      value={newItem.authorName}
                      onChange={(e) => setNewItem(prev => ({ ...prev, authorName: e.target.value }))}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={addItemMutation.isPending}>
                    {addItemMutation.isPending ? "Adding..." : "Add Feedback"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Retrospective Board */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(COLUMNS).map(([key, column]) => {
              const Icon = column.icon;
              const columnItems = groupedItems[key] || [];
              
              return (
                <Card key={key} className={`${column.bgColor} ${column.borderColor} border-2`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-base">
                      <Icon className={`w-5 h-5 ${column.iconColor}`} />
                      <span>{column.title}</span>
                      <Badge variant="secondary" className="ml-auto">
                        {columnItems.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {columnItems.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Icon className={`w-8 h-8 mx-auto mb-2 ${column.iconColor} opacity-50`} />
                        <p className="text-sm">No items yet</p>
                      </div>
                    ) : (
                      columnItems.map((item: any) => (
                        <div key={item.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 group">
                          <p className="text-sm text-gray-900 dark:text-gray-100 mb-2">{item.content}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {item.authorName || "Anonymous"}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                              onClick={() => deleteItemMutation.mutate(item.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {selectedTeam && !selectedBoard && boards && (
        <div className="text-center py-12">
          <RotateCcw className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Select a Retrospective</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Choose an existing retrospective board or create a new one to get started
          </p>
        </div>
      )}
    </div>
  );
}