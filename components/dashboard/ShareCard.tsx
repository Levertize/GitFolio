"use client";

import { useState } from "react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Share2, Copy, Linkedin, Twitter, Download, 
  Check, Loader2 
} from "lucide-react";

interface ShareCardProps {
  username: string;
}

export function ShareCard({ username }: ShareCardProps) {
  const [copied, setCheck] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const portfolioUrl = `${window.location.origin}/${username}`;
  const ogImageUrl = `/api/og?username=${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(portfolioUrl);
    setCheck(true);
    setTimeout(() => setCheck(false), 2000);
  };

  const shareToTwitter = () => {
    const text = `Check out my developer portfolio on GitFolio! 🚀\n\n${portfolioUrl}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareToLinkedin = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(portfolioUrl)}`, "_blank");
  };

  const downloadImage = async () => {
    try {
      setDownloading(true);
      const response = await fetch(ogImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${username}-gitfolio-stats.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-green-500 hover:bg-green-600 text-black font-bold h-9">
          <Share2 className="mr-2 h-4 w-4" /> Share Stats
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl bg-[#0d1117] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Share Your Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          {/* Image Preview */}
          <div className="relative group overflow-hidden rounded-xl border border-white/10 bg-black aspect-[1200/630]">
            <img 
              src={ogImageUrl} 
              alt="Stats Preview" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <p className="text-sm font-medium">Dynamic Stats Preview</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Action Buttons */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Links</p>
              <Button 
                variant="outline" 
                className="w-full justify-start border-white/5 bg-white/5 hover:bg-white/10 text-white"
                onClick={copyToClipboard}
              >
                {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? "Link Copied!" : "Copy Portfolio Link"}
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-white/5 bg-white/5 hover:bg-white/10 text-white"
                onClick={downloadImage}
                disabled={downloading}
              >
                {downloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Download Stats Image
              </Button>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Social Media</p>
              <div className="flex gap-2">
                <Button 
                  className="flex-1 bg-[#0077b5] hover:bg-[#0077b5]/90 text-white"
                  onClick={shareToLinkedin}
                >
                  <Linkedin className="mr-2 h-4 w-4" /> LinkedIn
                </Button>
                <Button 
                  className="flex-1 bg-white text-black hover:bg-white/90"
                  onClick={shareToTwitter}
                >
                  <Twitter className="mr-2 h-4 w-4" /> Twitter / X
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
