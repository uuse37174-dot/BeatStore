import React, { useState } from "react";
import { MessageSquare, Calendar, ChevronRight, User, CornerDownRight, Plus, Send, Search, Tag } from "lucide-react";
import { Post, SiteTexts } from "../types";

interface BlogViewProps {
  posts: Post[];
  categories: string[];
  isAdmin: boolean;
  onAddComment: (postId: string, author: string, content: string) => Promise<void>;
  onNavigateToShop: () => void;
  siteTexts: SiteTexts;
}

export default function BlogView({
  posts,
  categories,
  isAdmin,
  onAddComment,
  onNavigateToShop,
  siteTexts
}: BlogViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);
  
  // Local state for writing comment
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [submittingCommentForPost, setSubmittingCommentForPost] = useState<string | null>(null);

  // Search and filter logic
  const safePosts = Array.isArray(posts) ? posts : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

  const filteredPosts = safePosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCommentSubmit = async (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!commentAuthor.trim() || !commentContent.trim()) return;

    setSubmittingCommentForPost(postId);
    try {
      await onAddComment(postId, commentAuthor, commentContent);
      setCommentAuthor("");
      setCommentContent("");
    } catch (error) {
      console.error(error);
    } finally {
      setSubmittingCommentForPost(null);
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Banner / Hero Hero Grid section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-8 sm:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase mb-4 tracking-wider">
            {siteTexts?.heroPill || "Creative Hub & Journal"}
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight font-sans">
            {siteTexts?.heroTitle || "Fresh Audio Formulae & Production Aesthetics"}
          </h1>
          <p className="text-lg text-slate-300 mb-6 font-sans font-normal leading-relaxed">
            {siteTexts?.heroDescription || "Sharing industry insights, creator tutorials, and sound templates. Explore the store to support the channel and speed up your workflow!"}
          </p>
          <button
            onClick={onNavigateToShop}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-semibold tracking-wide transition shadow-lg transition-transform hover:scale-[1.02] cursor-pointer"
          >
            {siteTexts?.heroButton || "Browse Production Shop"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tools Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        
        {/* Category filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition tracking-wide whitespace-nowrap cursor-pointer ${
              selectedCategory === "All"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15"
                : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
            }`}
          >
            All Categories
          </button>
          
          {safeCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition tracking-wide whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15"
                  : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="relative min-w-[280px]">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search journal entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-sans"
          />
        </div>
      </div>

      {/* Main Grid: Entries lists */}
      <div className="grid grid-cols-1 gap-6">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800">
            <Tag className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-300 font-medium font-sans">No matching entries found</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting the filters or modifying your query</p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const hasComments = post.comments && post.comments.length > 0;
            const commentsExpanded = expandedCommentsPostId === post.id;
            
            return (
              <article 
                key={post.id}
                id={`post-card-${post.id}`}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition duration-200 space-y-4"
              >
                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(post.date)}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 rounded-md font-semibold tracking-wider uppercase text-[10px]">
                    {post.category}
                  </span>
                </div>

                {/* Optional cover photo */}
                {post.image ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 group aspect-[16/7] max-h-64 sm:max-h-80 flex items-center justify-center">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/10 to-transparent pointer-events-none" />
                  </div>
                ) : null}

                {/* Post Title */}
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 font-sans tracking-tight leading-snug">
                  {post.title}
                </h2>

                {/* Content Block */}
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                  {post.content}
                </p>

                {/* Thread Controls Footer bar */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setExpandedCommentsPostId(commentsExpanded ? null : post.id)}
                    className="inline-flex items-center gap-2 hover:text-indigo-600 text-slate-500 font-semibold text-xs tracking-medium cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    {hasComments ? `${post.comments.length} Comments` : "Write Comment"}
                  </button>
                  
                  {isAdmin && (
                    <span className="text-[10px] font-mono font-medium text-amber-500 border border-amber-400/30 bg-amber-500/5 px-2 py-0.5 rounded-md uppercase">
                      Author Account
                    </span>
                  )}
                </div>

                {/* Collapsible Comment Thread Panel */}
                {commentsExpanded && (
                  <div className="mt-6 pt-5 border-t border-dashed border-slate-200 dark:border-slate-800 space-y-6">
                    {/* Exiting comments feed list */}
                    {hasComments && (
                      <div className="space-y-4 pl-0 sm:pl-4">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                          <CornerDownRight className="w-3 h-3 text-indigo-500" />
                          Discussion Thread
                        </h4>
                        
                        <div className="space-y-3">
                          {(post.comments || []).map((comm) => (
                            <div 
                              key={comm.id}
                              className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 pl-4 pr-3.5 py-3 rounded-2xl relative"
                            >
                              <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
                                  <User className="w-3 h-3 text-slate-400" />
                                  {comm.author}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {formatDate(comm.date)}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-300 leading-loose font-sans">
                                {comm.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* New submission form */}
                    <form 
                      onSubmit={(e) => handleCommentSubmit(post.id, e)}
                      className="bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-3"
                    >
                      <h5 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Reply to this journal entry
                      </h5>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-1">
                          <input
                            type="text"
                            placeholder="Your Name"
                            value={commentAuthor}
                            required
                            onChange={(e) => setCommentAuthor(e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            placeholder="Write your comment thoughts here..."
                            value={commentContent}
                            required
                            onChange={(e) => setCommentContent(e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={submittingCommentForPost === post.id}
                          className="px-4 py-2 rounded-xl text-xs font-semibold uppercase bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Publish Comment
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
