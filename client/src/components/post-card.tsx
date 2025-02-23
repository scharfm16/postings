import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PostWithUser } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import CommentSection from "./comment-section";

export default function PostCard({ post }: { post: PostWithUser }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar>
          <AvatarImage src={post.user.avatarUrl || undefined} />
          <AvatarFallback>{post.user.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-semibold">{post.user.username}</span>
          <span className="text-sm text-muted-foreground">
            {post.createdAt && formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">{post.content}</p>
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt="Post content"
            className="rounded-lg w-full object-cover max-h-96"
          />
        )}
        <CommentSection postId={post.id} />
      </CardContent>
    </Card>
  );
}