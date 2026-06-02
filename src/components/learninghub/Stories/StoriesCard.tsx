"use client";
import React, { useState, useEffect } from "react";
import { useSaved } from "../Saved/SavedContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Story } from "../../../lib/api/stories";
import { Heart } from "lucide-react";
import { useTranslations } from "../../../lib/i18n";

export const StoriesCard: React.FC<Story> = (props) => {
  const { savedStories, toggleStory } = useSaved();
  const [isSaved, setIsSaved] = useState(false);
  const router = useRouter();
  const { tLearninghub, lang } = useTranslations();

  useEffect(() => {
    setIsSaved(savedStories.some((s) => s.id === props.id));
  }, [savedStories, props.id]);

  const goToDetail = () => {
    router.push(`/knowledge/detail-stories/${props.id}`);
  };

  const formatReadTime = (readTime: string) => {
    if (lang === "kh") {
      return readTime
        .replace(/min|mins|minute|minutes/gi, "នាទី")
        .replace(/read|Read/gi, "អាន");
    }
    return readTime;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="
        w-full flex flex-col items-center
      "
    >
      <div
        className="
          rounded-lg border border-[#EBECF0] bg-white overflow-hidden
          w-full
          max-w-[360px] sm:max-w-[420px] md:max-w-[500px] lg:max-w-[420px]
          font-[Kantumruy_Pro] cursor-pointer
        "
        onClick={goToDetail}
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
            alt={props.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* CONTENT */}
        <div className="p-3 sm:p-4 flex flex-col gap-3">
          {/* USER INFO */}
          <div className="flex items-center gap-3">
            <img
              src={props.avatar_url}
              alt="User Avatar"
              className="rounded-full w-[38px] h-[38px] sm:w-[42px] sm:h-[42px]"
            />
            <div className="flex flex-col">
              <span className="text-[13px] sm:text-sm md:text-base font-semibold text-gray-900">
                {props.username}
              </span>
              <div className="flex items-center gap-2 text-[11px] sm:text-xs md:text-sm text-gray-500">
                <img
                  src="/icons/learninghub/icon_location.svg"
                  alt={tLearninghub("location")}
                  className="w-2.5 h-2.5"
                />
                <span className="truncate max-w-[160px] sm:max-w-[220px] md:max-w-none">
                  {props.location}
                </span>
              </div>
            </div>
          </div>

          {/* TITLE */}
          <h3 className="text-[#0D1B2A] text-[13px] sm:text-[15px] md:text-[16px] font-medium">
            {props.title}
          </h3>

          {/* DESCRIPTION */}
          <p className="text-[#4B5563] text-[11px] sm:text-[13px] md:text-sm line-clamp-3 md:line-clamp-4">
            {props.description}
          </p>

          {/* META INFO */}
          <div className="flex flex-wrap items-center gap-3 text-[#6B7280] text-[11px] sm:text-xs md:text-sm">
            <div className="flex gap-1 items-center">
              <img
                src="/icons/learninghub/icon_calendar.svg"
                alt={tLearninghub("calendar")}
                className="w-3.5 h-3.5"
              />
              <span>{props.date}</span>
            </div>

            <div className="flex gap-1 items-center">
              <img
                src="/icons/learninghub/icon_oclock.svg"
                alt={tLearninghub("readTime")}
                className="w-3.5 h-3.5"
              />
              <span>{formatReadTime(props.read_time)}</span>
            </div>

            <div className="flex gap-1 items-center">
              <img
                src="/icons/learninghub/heart.svg"
                alt={tLearninghub("likes")}
                className="w-3.5 h-3.5"
              />
              <span>{props.likes_count}</span>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center justify-between gap-2 mt-2">
            {/* Save Button */}
            <motion.button
              onClick={(e) => { e.stopPropagation(); toggleStory(props); }}
              className={`
                flex items-center justify-center
                w-[46px] sm:w-[52px] md:w-[56px]
                h-[34px] sm:h-[36px]
                transition-all duration-200
                ${
                  isSaved
                    ? "bg-[#0E4123] rounded-lg border-none"
                    : "bg-transparent rounded-lg border border-[#0E4123]"
                }
              `}
              whileTap={{ scale: 0.9 }}
            >
              <Heart
                size={20}
                className={isSaved ? "fill-white text-white" : "text-[#0E4123]"}
              />
            </motion.button>

            {/* Read Story */}
            <motion.button
              onClick={(e) => { e.stopPropagation(); goToDetail(); }}
              className="
                items-center rounded-lg bg-[#0E4123] text-white font-medium
                w-full h-[34px] sm:h-[36px]
                flex  justify-center
              "
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {tLearninghub("readFullStory")}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StoriesCard;
