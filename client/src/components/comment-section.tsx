import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CommentWithUser } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function CommentSection({ postId }: { postId: number }) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: comments, isLoading } = useQuery<CommentWithUser[]>({
    queryKey: [`/api/posts/${postId}/comments`],
    enabled: showComments,
  });

  const createCommentMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/posts/${postId}/comments`, {
        content: newComment,
      });
      return res.json();
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({
        queryKey: [`/api/posts/${postId}/comments`],
      });
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (newComment.trim()) {
      createCommentMutation.mutate();
    }
  }

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        className="p-0 h-auto"
        onClick={() => setShowComments(!showComments)}
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        {showComments ? "Hide" : "Show"} Comments
      </Button>

      {showComments && (
        <>
          <Separator />

          <form onSubmit={handleSubmitComment} className="flex gap-2">
            <Input
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={createCommentMutation.isPending}
            />
            <Button
              type="submit"
              disabled={!newComment.trim() || createCommentMutation.isPending}
            >
              {createCommentMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Post"
              )}
            </Button>
          </form>

          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))
            ) : comments?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments?.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user.avatarUrl || undefined} />
                    <AvatarFallback>
                      {comment.user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {comment.user.username}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {comment.createdAt && formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}