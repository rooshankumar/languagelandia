import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Flame, 
  Heart, 
  Languages, 
  MapPin, 
  MessageCircle, 
  Share2, 
  User 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contex/AuthContext";

interface UserProfile {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  nativeLanguage: string;
  learningLanguage: string;
  proficiencyLevel: string;
  streak: number;
  joinDate: string;
  interests: string[];
  avatar: string;
  likes: number;
  liked: boolean;
  learning: {
    vocabulary: number;
    grammar: number;
    speaking: number;
    listening: number;
  };
  achievements: {
    title: string;
    description: string;
    date: string;
    icon: string;
  }[];
}

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      if (!id) {
        if (isMounted) {
          setLoading(false);
          navigate('/community');
        }
        return;
      }

      setLoading(true);
      try {
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select(`
            id,
            username,
            bio,
            avatar_url,
            likes_count,
            is_online,
            created_at,
            achievements:user_achievements (
              title,
              description,
              date,
              icon
            )
          `)
          .eq('id', id)
          .single();

        if (profileError) throw profileError;

        // Fetch user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select(`
            full_name,
            native_language,
            learning_language,
            proficiency_level,
            streak_count,
            date_of_birth,
            created_at
          `)
          .eq('id', id)
          .single();

        if (userError) throw userError;

        // Check if current user has liked this profile
        let isLiked = false;
        if (currentUser) {
          const { data: likeData } = await supabase
            .from('user_likes')
            .select()
            .eq('liker_id', currentUser.id)
            .eq('liked_id', id)
            .single();
          isLiked = !!likeData;
        }

        if (isMounted && profileData) {
          const age = userData?.date_of_birth 
            ? new Date().getFullYear() - new Date(userData.date_of_birth).getFullYear()
            : 25;

          setProfile({
            id: profileData.id,
            name: userData?.full_name || profileData.username || `User_${id.slice(0, 5)}`,
            age,
            location: "Unknown", // Default since not in your schema
            bio: profileData.bio || "Hello! I'm learning languages",
            nativeLanguage: userData?.native_language || "Not specified",
            learningLanguage: userData?.learning_language || "Not specified",
            proficiencyLevel: userData?.proficiency_level || "Beginner",
            streak: userData?.streak_count || 0,
            joinDate: userData?.created_at || profileData.created_at || new Date().toISOString(),
            interests: ["Language Learning"], // Default since not in your schema
            avatar: profileData.avatar_url || "/placeholder.svg",
            likes: profileData.likes_count || 0,
            liked: isLiked,
            learning: {
              vocabulary: 25, // Default values
              grammar: 25,
              speaking: 25,
              listening: 25
            },
            achievements: profileData.achievements || [
              {
                title: "Getting Started",
                description: "Joined the platform",
                date: userData?.created_at || profileData.created_at || new Date().toISOString(),
                icon: "🌟"
              }
            ]
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        if (isMounted) {
          toast({
            title: "Error",
            description: "Failed to load profile data",
            variant: "destructive"
          });
          setProfile(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [id, toast, navigate, currentUser]);

  const handleLike = async () => {
    if (!profile || !currentUser) return;

    try {
      const newLiked = !profile.liked;
      const newLikes = newLiked ? profile.likes + 1 : profile.likes - 1;

      // Update in database
      const { error } = await supabase
        .from('profiles')
        .update({ likes_count: newLikes })
        .eq('id', profile.id);

      if (error) throw error;

      // Update user_likes table
      if (newLiked) {
        await supabase
          .from('user_likes')
          .insert({
            liker_id: currentUser.id,
            liked_id: profile.id,
            created_at: new Date().toISOString()
          });
      } else {
        await supabase
          .from('user_likes')
          .delete()
          .eq('liker_id', currentUser.id)
          .eq('liked_id', profile.id);
      }

      setProfile({
        ...profile,
        liked: newLiked,
        likes: newLikes
      });

      toast({
        title: newLiked ? "Profile liked" : "Like removed",
        description: newLiked 
          ? `You've liked ${profile.name}'s profile` 
          : `You've removed your like from ${profile.name}'s profile`,
      });
    } catch (error) {
      console.error("Error updating like:", error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive"
      });
    }
  };

  const calculateJoinedTime = (dateString: string) => {
    const joinDate = new Date(dateString);
    const now = new Date();

    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays} days ago`;
    } else {
      const diffMonths = Math.floor(diffDays / 30);
      return diffMonths === 1 ? "1 month ago" : `${diffMonths} months ago`;
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied to clipboard",
      description: "You can now share this profile with others",
    });
  };

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-12 text-center">
        <h2 className="text-2xl font-bold mb-2">User not found</h2>
        <p className="text-muted-foreground mb-6">
          The profile you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link to="/community">Back to Community</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container pb-12 animate-fade-in">
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center space-x-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
                <Avatar className="h-24 w-24 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
                  <AvatarImage src={profile.avatar} alt={profile.name} />
                  <AvatarFallback className="text-2xl">{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{profile.name}</DialogTitle>
                <DialogDescription>Profile picture</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 p-4">
                <img 
                  src={profile.avatar} 
                  alt={profile.name} 
                  className="max-w-full max-h-[60vh] object-contain rounded-md"
                />
              </div>
            </DialogContent>
          </Dialog>

          <div>
            <h1 className="text-3xl font-bold">{profile.name}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{profile.age} years old</span>
              <span className="text-muted-foreground">•</span>
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{profile.location}</span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Joined {calculateJoinedTime(profile.joinDate)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button 
            variant={profile.liked ? "default" : "outline"} 
            size="sm" 
            className={`button-hover ${profile.liked ? "bg-red-500 hover:bg-red-600 text-white" : ""}`}
            onClick={handleLike}
          >
            <Heart className={`h-4 w-4 mr-2 ${profile.liked ? "fill-white" : ""}`} />
            {profile.likes}
          </Button>

          <Button variant="outline" size="sm" className="button-hover" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>

          <Button asChild size="sm" className="button-hover">
            <Link to={`/chat/${profile.id}`}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
            </Link>
          </Button>
        </div>
      </div>

      <Card className="mb-8 glass-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold">Language Skills</h3>
              <div className="flex flex-col space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                  <Languages className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Native language:</span>
                  <Badge variant="secondary">{profile.nativeLanguage}</Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Languages className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Learning:</span>
                  <Badge>{profile.learningLanguage}</Badge>
                  <span className="text-xs text-muted-foreground">({profile.proficiencyLevel})</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-1">
                  <Flame className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">{profile.streak}</span>
                </div>
                <span className="text-xs text-muted-foreground">day streak</span>
              </div>

              <div className="h-12 w-px bg-border"></div>

              <div>
                <h4 className="text-sm font-medium mb-1">Study Progress</h4>
                <div className="grid grid-cols-4 gap-2">
                  <div className="flex flex-col items-center">
                    <div className="relative w-10 h-10">
                      <svg className="w-10 h-10" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-muted stroke-2" />
                        <circle 
                          cx="18" cy="18" r="16" fill="none" 
                          className="stroke-primary stroke-2" 
                          strokeDasharray="100" 
                          strokeDashoffset={100 - profile.learning.vocabulary} 
                          transform="rotate(-90 18 18)" 
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                        {profile.learning.vocabulary}%
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">Vocab</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="relative w-10 h-10">
                      <svg className="w-10 h-10" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-muted stroke-2" />
                        <circle 
                          cx="18" cy="18" r="16" fill="none" 
                          className="stroke-primary stroke-2" 
                          strokeDasharray="100" 
                          strokeDashoffset={100 - profile.learning.grammar} 
                          transform="rotate(-90 18 18)" 
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                        {profile.learning.grammar}%
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">Grammar</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="relative w-10 h-10">
                      <svg className="w-10 h-10" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-muted stroke-2" />
                        <circle 
                          cx="18" cy="18" r="16" fill="none" 
                          className="stroke-primary stroke-2" 
                          strokeDasharray="100" 
                          strokeDashoffset={100 - profile.learning.speaking} 
                          transform="rotate(-90 18 18)" 
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                        {profile.learning.speaking}%
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">Speaking</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="relative w-10 h-10">
                      <svg className="w-10 h-10" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-muted stroke-2" />
                        <circle 
                          cx="18" cy="18" r="16" fill="none" 
                          className="stroke-primary stroke-2" 
                          strokeDasharray="100" 
                          strokeDashoffset={100 - profile.learning.listening} 
                          transform="rotate(-90 18 18)" 
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                        {profile.learning.listening}%
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">Listening</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="about" className="mb-8">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="interests">Interests</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>About {profile.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{profile.bio}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 rounded-lg border border-border">
                    <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full text-xl">
                      {achievement.icon}
                    </div>
                    <div>
                      <h4 className="font-medium">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Achieved on {new Date(achievement.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interests" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Interests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <Badge key={index} variant="secondary" className="py-1.5">
                    {interest}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center space-x-4">
        <Button asChild variant="outline" className="button-hover">
          <Link to="/community">
            Back to Community
          </Link>
        </Button>
        <Button asChild className="button-hover">
          <Link to={`/chat/${profile.id}`}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Start Conversation
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Profile;