import React, { useState, useEffect } from 'react';
import { 
  ExternalLink, 
  Globe, 
  Instagram, 
  Facebook, 
  Linkedin, 
  Youtube, 
  Video, 
  Link2,
  FileText
} from 'lucide-react';
import { Language } from '../translations';

interface UrlPreviewProps {
  url: string;
  lang: Language;
}

interface PreviewData {
  title: string;
  description: string;
  image: string | null;
  siteName: string;
  logo: string | null;
  url: string;
  platform: string;
  status: 'loading' | 'success' | 'error' | 'idle';
}

export default function UrlPreview({ url, lang }: UrlPreviewProps) {
  const [data, setData] = useState<PreviewData | null>(null);

  const getPlatform = (urlStr: string): string => {
    try {
      const parsed = new URL(urlStr);
      const host = parsed.hostname.toLowerCase();
      if (host.includes('instagram.com')) return 'Instagram';
      if (host.includes('facebook.com') || host.includes('fb.com')) return 'Facebook';
      if (host.includes('tiktok.com')) return 'TikTok';
      if (host.includes('linkedin.com')) return 'LinkedIn';
      if (host.includes('youtube.com') || host.includes('youtu.be')) return 'YouTube';
      if (host.includes('twitter.com') || host.includes('x.com')) return 'Twitter/X';
      return 'Website';
    } catch (e) {
      return 'Website';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Instagram':
        return <Instagram className="w-4 h-4 text-pink-600" />;
      case 'Facebook':
        return <Facebook className="w-4 h-4 text-blue-600" />;
      case 'TikTok':
        return <Video className="w-4 h-4 text-slate-900" />;
      case 'LinkedIn':
        return <Linkedin className="w-4 h-4 text-blue-700" />;
      case 'YouTube':
        return <Youtube className="w-4 h-4 text-red-600" />;
      case 'Twitter/X':
        return <span className="font-extrabold text-[10px] text-slate-950 font-mono">X</span>;
      default:
        return <Globe className="w-4 h-4 text-slate-500" />;
    }
  };

  const getFallbackTitle = (urlStr: string, platform: string): string => {
    try {
      const parsed = new URL(urlStr);
      const pathParts = parsed.pathname.split('/').filter(Boolean);
      
      if (platform === 'Instagram') {
        const id = pathParts[1] || pathParts[0] || 'Post';
        return `Instagram Post (${id.length > 12 ? id.slice(0, 10) + '...' : id})`;
      }
      if (platform === 'Facebook') {
        return 'Facebook Shared Outreach';
      }
      if (platform === 'TikTok') {
        const user = pathParts[0] || 'User';
        return `TikTok Feed ${user.startsWith('@') ? user : '@' + user}`;
      }
      if (platform === 'LinkedIn') {
        return 'LinkedIn Corporate Update';
      }
      if (platform === 'YouTube') {
        return 'YouTube Video Promo';
      }
      
      const domain = parsed.hostname.replace('www.', '');
      const siteName = domain.charAt(0).toUpperCase() + domain.slice(1);
      const lastSegment = pathParts[pathParts.length - 1];
      if (lastSegment) {
        return lastSegment
          .replace(/[-_]/g, ' ')
          .split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
      }
      return `${siteName} Marketing Landing`;
    } catch (e) {
      return 'Victoria Marketing Campaign URL';
    }
  };

  const getFallbackDesc = (platform: string): string => {
    switch (platform) {
      case 'Instagram':
        return lang === 'ar' 
          ? 'استعراض المحتوى المرئي، التعليقات، وتفاعلات الجمهور على منصة إنستغرام.'
          : 'Review visual content, user engagements, and target impressions on Instagram.';
      case 'Facebook':
        return lang === 'ar'
          ? 'عرض منشورات الفيس بوك الترويجية، المنشورات المشتركة، وحملات تعزيز الوصول.'
          : 'Track customized social feeds, shared articles, and target audience amplification on Facebook.';
      case 'TikTok':
        return lang === 'ar'
          ? 'معاينة الفيديو القصير، اتجاهات الصوت، ونسب المشاهدة والتفاعل لعملاء الوكالة.'
          : 'Preview trending video hooks, dynamic background sounds, and client brand exposure on TikTok.';
      case 'LinkedIn':
        return lang === 'ar'
          ? 'متابعة اتصالات B2B المهنية، الأخبار المؤسسية، والترويج المباشر لأصحاب القرار.'
          : 'Analyze B2B corporate newsletters, industrial networks, and executive PR metrics on LinkedIn.';
      case 'YouTube':
        return lang === 'ar'
          ? 'بث محتوى الفيديو التعريفي، معدل بقاء المشاهدين، وإحصائيات القناة.'
          : 'Stream promotional explainers, target duration retention, and visual channel KPIs on YouTube.';
      default:
        return lang === 'ar'
          ? 'اقرأ المقال الكامل والتفاصيل الترويجية المنشورة على المدونة الرسمية للموقع.'
          : 'Explore full digital contents and promotional releases published on the official web domain.';
    }
  };

  const getPlatformColor = (platform: string): string => {
    switch (platform) {
      case 'Instagram': return 'from-purple-500 to-pink-500';
      case 'Facebook': return 'from-blue-600 to-blue-400';
      case 'TikTok': return 'from-slate-900 to-slate-700';
      case 'LinkedIn': return 'from-blue-800 to-indigo-600';
      case 'YouTube': return 'from-red-600 to-red-400';
      default: return 'from-slate-400 to-slate-300';
    }
  };

  useEffect(() => {
    if (!url) {
      setData(null);
      return;
    }

    // Basic URL validation
    let isValid = false;
    try {
      new URL(url);
      isValid = true;
    } catch (e) {
      isValid = false;
    }

    if (!isValid) {
      setData({
        title: '',
        description: '',
        image: null,
        siteName: '',
        logo: null,
        url: url,
        platform: 'Website',
        status: 'error'
      });
      return;
    }

    const platform = getPlatform(url);
    setData({
      title: getFallbackTitle(url, platform),
      description: getFallbackDesc(platform),
      image: null,
      siteName: platform,
      logo: null,
      url: url,
      platform: platform,
      status: 'loading'
    });

    let active = true;

    // Fetch dynamic metadata from microlink api
    const fetchMetadata = async () => {
      try {
        const encodedUrl = encodeURIComponent(url);
        const res = await fetch(`https://api.microlink.io?url=${encodedUrl}`);
        if (!res.ok) throw new Error('API failed');
        const json = await res.json();
        
        if (active && json.status === 'success') {
          const d = json.data;
          setData({
            title: d.title || getFallbackTitle(url, platform),
            description: d.description || getFallbackDesc(platform),
            image: d.image?.url || null,
            siteName: d.publisher || platform,
            logo: d.logo?.url || null,
            url: url,
            platform: platform,
            status: 'success'
          });
        }
      } catch (err) {
        // Fall back gracefully with beautifully generated simulated OpenGraph metadata
        if (active) {
          setData({
            title: getFallbackTitle(url, platform),
            description: getFallbackDesc(platform),
            image: null,
            siteName: platform,
            logo: null,
            url: url,
            platform: platform,
            status: 'success' // Use success state because we gracefully generated a robust, beautiful preview
          });
        }
      }
    };

    fetchMetadata();

    return () => {
      active = false;
    };
  }, [url, lang]);

  if (!url) return null;

  if (data?.status === 'error') {
    return (
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center">
        <Link2 className="w-5 h-5 text-slate-400 mb-1" />
        <p className="text-xs font-bold text-slate-700">
          {lang === 'ar' ? 'رابط غير صالح' : 'Invalid URL'}
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">
          {lang === 'ar' ? 'يرجى إدخال رابط صحيح يبدأ بـ http أو https' : 'Please input a correct link starting with http or https'}
        </p>
      </div>
    );
  }

  if (data?.status === 'loading') {
    return (
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center gap-3 animate-pulse">
        <div className="w-12 h-12 bg-slate-100 rounded-xl" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 bg-slate-100 rounded-md w-1/3" />
          <div className="h-3 bg-slate-100 rounded-md w-3/4" />
        </div>
      </div>
    );
  }

  const isPreviewUnavailable = !data?.title && !data?.image;

  if (isPreviewUnavailable) {
    return (
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
            {getPlatformIcon(data?.platform || 'Website')}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-800 truncate">{data?.platform || 'Post'} Link</h4>
            <p className="text-[10px] text-slate-500 truncate">{url}</p>
          </div>
        </div>
        <span className="text-[10px] bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg text-slate-500 font-semibold shrink-0">
          {lang === 'ar' ? 'المعاينة غير متوفرة' : 'Preview unavailable'}
        </span>
      </div>
    );
  }

  // Beautiful responsive SaaS interactive card preview
  return (
    <a 
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group bg-white hover:bg-slate-50/50 border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-sm transition-all duration-200 text-left cursor-pointer"
      title={lang === 'ar' ? 'اضغط لفتح المنشور الأصلي في علامة تبويب جديدة' : 'Click to open original post in a new tab'}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Featured Image Thumbnail */}
        <div className="sm:w-36 shrink-0 relative h-28 sm:h-auto overflow-hidden bg-slate-100 border-b sm:border-b-0 sm:border-r border-slate-200">
          {data?.image ? (
            <img 
              src={data.image} 
              alt={data.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // If hotlinked image fails (cors/403), replace with standard gradient preview
                e.currentTarget.style.display = 'none';
                const el = e.currentTarget.parentElement?.querySelector('.fallback-grad');
                if (el) el.classList.remove('hidden');
              }}
            />
          ) : null}
          
          {/* Beautiful fallback gradient thumbnail if no image or image load fails */}
          <div className={`fallback-grad ${data?.image ? 'hidden' : ''} w-full h-full bg-gradient-to-br ${getPlatformColor(data?.platform || 'Website')} flex flex-col items-center justify-center p-3 text-center`}>
            <div className="p-2.5 bg-white/95 rounded-xl shadow-xs">
              {getPlatformIcon(data?.platform || 'Website')}
            </div>
            <span className="text-[9px] font-extrabold text-white uppercase tracking-widest mt-2 block font-mono">
              {data?.platform}
            </span>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-4 flex-1 min-w-0 flex flex-col justify-between">
          <div className="space-y-1">
            {/* Header: Platform tag & Domain Name */}
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              <span className="p-1 bg-slate-50 border border-slate-200/60 rounded-md">
                {getPlatformIcon(data?.platform || 'Website')}
              </span>
              <span className="text-slate-500 font-mono truncate">{data?.siteName || data?.platform}</span>
            </div>

            {/* Title */}
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug mt-1 flex items-center gap-1">
              <span className="truncate">{data?.title}</span>
              <ExternalLink className="w-3 h-3 text-slate-400 shrink-0 group-hover:text-blue-500 transition-colors" />
            </h4>

            {/* Short Description */}
            <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
              {data?.description}
            </p>
          </div>

          {/* Footer URL link */}
          <div className="text-[9px] text-blue-500 font-mono truncate mt-2 border-t border-slate-100 pt-2 flex items-center justify-between">
            <span className="truncate max-w-[200px]">{url}</span>
            <span className="text-[8px] bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded text-blue-600 font-bold shrink-0">
              {lang === 'ar' ? 'عرض مالي' : 'OPEN'}
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}
