import React from 'react';
import { motion } from 'framer-motion';

interface SkillSelectorProps {
  selectedSkill: number;
  onSkillSelect: (skill: number) => void;
}

export const SkillSelector: React.FC<SkillSelectorProps> = ({
  selectedSkill,
  onSkillSelect
}) => {
  const skillLevels = [
    { value: 1, label: 'Beginner', description: 'New to soccer' },
    { value: 2, label: 'Casual', description: 'Plays occasionally' },
    { value: 3, label: 'Skilled', description: 'Experienced player' },
    { value: 4, label: 'Expert', description: 'Highly skilled' }
  ];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium text-white mb-2">Skill Level</h3>
        <p className="text-sm text-gray-400">Select your soccer skill level</p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {skillLevels.map((skill, index) => (
          <motion.button
            key={skill.value}
            onClick={() => onSkillSelect(skill.value)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              relative p-3 rounded-xl border-2 transition-all duration-200
              ${selectedSkill === skill.value
                ? 'border-pitch-green bg-pitch-green/20 shadow-lg shadow-pitch-green/25'
                : 'border-gray-600 hover:border-gray-500'
              }
            `}
          >
            {/* Soccer ball representation */}
            <div className="flex flex-col items-center space-y-2">
              <div className={`
                w-8 h-8 rounded-full border-2 flex items-center justify-center
                ${selectedSkill === skill.value
                  ? 'border-pitch-green bg-pitch-green text-white'
                  : 'border-gray-500 text-gray-400'
                }
              `}>
                <span className="text-xs font-bold">{skill.value}</span>
              </div>

              <div className="text-center">
                <div className={`text-xs font-medium ${
                  selectedSkill === skill.value ? 'text-pitch-green' : 'text-gray-300'
                }`}>
                  {skill.label}
                </div>
              </div>
            </div>

            {/* Selected indicator */}
            {selectedSkill === skill.value && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-pitch-green rounded-full border-2 border-surface-elevated flex items-center justify-center"
              >
                <div className="w-2 h-2 bg-white rounded-full" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {selectedSkill > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="text-center p-3 bg-pitch-green/10 rounded-lg border border-pitch-green/20"
        >
          <p className="text-sm text-pitch-green font-medium">
            {skillLevels[selectedSkill - 1]?.label}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {skillLevels[selectedSkill - 1]?.description}
          </p>
        </motion.div>
      )}
    </div>
  );
};