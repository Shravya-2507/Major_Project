import React from "react";

const SkillCard = ({ skill }) => {
  return (
    <div className="p-4 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200 bg-gradient-to-br from-white to-gray-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-gray-700">{skill.name}</h3>
        <span
          className="text-sm font-medium"
          style={{ color: skill.color }}
        >
          {skill.percent}%
        </span>
      </div>

      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${skill.percent}%`,
            backgroundColor: skill.color,
          }}
        />
      </div>
    </div>
  );
};

export default SkillCard;