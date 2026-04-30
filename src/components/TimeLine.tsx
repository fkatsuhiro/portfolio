import React from "react";

export interface TimelineItem {
  date: string;
  title: string;
  description: string;
}

interface TimelineProps {
  items: TimelineItem[];
}

export const Timeline: React.FC<TimelineProps> = ({ items }) => {
  return (
    <div className="py-10 px-4 max-w-5xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <div className="relative">
        <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 top-0 h-full w-0.5 bg-gray-300 dark:bg-gray-700" />

        <div className="space-y-12">
          {items.map((item, index) => {
            const isEven = index % 2 === 0;

            return (
              <div
                key={index}
                className="relative flex items-center md:justify-between"
              >
                <div className="hidden md:block w-5/12">
                  {isEven ? (
                    <TimelineCard item={item} position="left" />
                  ) : (
                    <div className="text-right pr-8">
                      <span className="text-gray-500 dark:text-gray-400 font-mono text-lg">
                        {item.date}
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full border-4 border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-900 z-10 box-border" />
                <div className="w-full pl-12 md:pl-0 md:w-5/12">
                  <div className="block md:hidden mb-2">
                    <span className="text-gray-500 dark:text-gray-400 font-mono text-sm block mb-1">
                      {item.date}
                    </span>
                  </div>
                  <div className="block md:hidden">
                    <TimelineCard
                      item={item}
                      position="right"
                      isMobile={true}
                    />
                  </div>
                  <div className="hidden md:block">
                    {isEven ? (
                      <div className="text-left pl-8">
                        <span className="text-gray-500 dark:text-gray-400 font-mono text-lg">
                          {item.date}
                        </span>
                      </div>
                    ) : (
                      <TimelineCard item={item} position="right" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface CardProps {
  item: TimelineItem;
  position: "left" | "right";
  isMobile?: boolean;
}

const TimelineCard: React.FC<CardProps> = ({
  item,
  position,
  isMobile = false,
}) => {
  return (
    <div className="relative bg-white dark:bg-gray-800 p-6 rounded-lg border-b-4 border-gray-600 dark:border-gray-500 shadow-md transition-colors duration-300">
      <div
        className={`absolute top-6 w-0 h-0 border-y-[10px] border-y-transparent
          ${
            isMobile
              ? "left-[-10px] border-r-[10px] border-r-white dark:border-r-gray-800"
              : position === "left"
                ? "right-[-10px] border-l-[10px] border-l-white dark:border-l-gray-800"
                : "left-[-10px] border-r-[10px] border-r-white dark:border-r-gray-800"
          }
        `}
      />
      <p className="text-lg font-bold text-gray-800 dark:text-white mb-2">
        {item.title}
      </p>
      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
        {item.description}
      </p>
    </div>
  );
};

export default Timeline;
