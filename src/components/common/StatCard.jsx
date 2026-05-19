import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, title, value, index }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow"
    >
      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <h3 className="text-3xl font-bold text-slate-900 mb-1">{value}</h3>
      <p className="text-slate-500 font-medium">{title}</p>
    </motion.div>
  );
};

export default StatCard;
