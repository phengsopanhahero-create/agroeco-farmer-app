"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSaved } from "../Saved/SavedContext";
import { motion } from "framer-motion";
import { Guide } from "../../../lib/api/guides";
import { Heart } from "lucide-react";
import { useTranslations } from "../../../lib/i18n";

const GuideCard: React.FC<Guide> = (props) => {
  const { savedGuides, toggleGuide } = useSaved();
  const router = useRouter();
  const { tLearninghub, lang } = useTranslations();

  const [isGuideSaved, setIsGuideSaved] = useState(false);

  useEffect(() => {
    setIsGuideSaved(savedGuides.some((g) => g.id === props.id));
  }, [savedGuides, props.id]);

  const handleReadGuide = () => {
    router.push(`/knowledge/detail-guide/${props.id}`);
  };

  // Format read time
  const formatReadTime = (readTime: string) => {
    if (lang === "kh") {
      return readTime
        .replace(/min|mins|minute|minutes/gi, "នាទី")
        .replace(/read|Read/gi, "អាន");
    }
    return readTime;
  };

  // Translate category
  const translateCategory = (category: string) => {
    const categoryMap: Record<string, Record<"en" | "kh", string>> = {
      "Soil & Compost": { en: "Soil & Compost", kh: "ដី និងជីកំប៉ុស" },
      Fertilizer: { en: "Fertilizer", kh: "ជី" },
      "Plant Care": { en: "Plant Care", kh: "ការថែរក្សាដំណាំ" },
    };
    return categoryMap[category]?.[lang] || category;
  };

  return (
    <motion.div
      className="
        rounded-lg border border-[#EBECF0] bg-white overflow-hidden
        mx-auto font-[Kantumruy_Pro]
        w-full
        max-w-[360px] sm:max-w-[420px] md:max-w-[500px] lg:max-w-[420px]
        cursor-pointer
      "
      onClick={handleReadGuide}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* IMAGE */}
      <div
        className="
        relative w-full 
        h-[160px] sm:h-[180px] md:h-[200px] lg:h-[220px]
      "
      >
        <img
          src={props.image_url}
          alt={translateCategory(props.category)}
          className="w-full h-full object-cover"
        />

        {/* CATEGORY BADGE */}
        <span
          className="
          absolute top-0 left-0 bg-[#0E4123] text-white 
          px-3 py-1 rounded-br-lg 
          text-[10px] sm:text-xs md:text-sm
        "
        >
          {translateCategory(props.category)}
        </span>
      </div>

      {/* CONTENT */}
      <div className="p-3 sm:p-4 flex flex-col gap-3">
        {/* Title */}
        <h3
          className="
          text-[#0D1B2A] font-medium 
          text-[13px] sm:text-[15px] md:text-[16px]
        "
        >
          {props.title}
        </h3>

        {/* Description */}
        <p
          className="
          text-[#4B5563] 
          text-[11px] sm:text-[13px] md:text-sm 
          line-clamp-3 md:line-clamp-4
        "
        >
          {props.description}
        </p>

        {/* META */}
        <div
          className="
          flex flex-wrap items-center justify-between 
          text-[#6B7280] text-[10px] sm:text-xs md:text-sm
          gap-2
        "
        >
          <span className="truncate max-w-[150px] sm:max-w-[220px]">
            {tLearninghub("author")}: {props.author}
          </span>

          <div className="flex items-center gap-1">
            <img
              src="/icons/learninghub/icon_calendar.svg"
              alt={tLearninghub("calendar")}
              className="w-[14px] h-[14px]"
            />
            <span>{props.date}</span>
          </div>

          <div className="flex items-center gap-1">
            <img
              src="/icons/learninghub/icon_oclock.svg"
              alt={tLearninghub("readTime")}
              className="w-3.5 h-3.5"
            />
            <span>{formatReadTime(props.read_time)}</span>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-between gap-2 mt-2">
          {/* Save Button */}
          <motion.button
            onClick={(e) => { e.stopPropagation(); toggleGuide(props); }}
            className={`
              flex items-center justify-center 
              w-[48px] sm:w-[52px] md:w-[56px] 
              h-[34px] sm:h-[36px]
              transition-all duration-200
              ${
                isGuideSaved
                  ? "bg-[#0E4123] rounded-lg border-none"
                  : "bg-transparent rounded-lg border border-[#0E4123]"
              }
            `}
            whileTap={{ scale: 0.9 }}
          >
            <Heart
              size={20}
              className={
                isGuideSaved ? "fill-white text-white" : "text-[#0E4123]"
              }
            />
          </motion.button>

          {/* Read Button */}
          <motion.button
            onClick={(e) => { e.stopPropagation(); handleReadGuide(); }}
            className="
              items-center
              rounded-lg bg-[#0E4123] text-white font-medium
              w-full h-[34px] sm:h-[36px]
            "
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {tLearninghub("readGuide")}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default GuideCard;
