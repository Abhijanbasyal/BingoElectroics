export const sidebarVariants = {
  open: { 
    x: 0,
    transition: { 
      type: 'spring', 
      stiffness: 400, 
      damping: 30,
      when: "beforeChildren",
      staggerChildren: 0.1
    } 
  },
  closed: { 
    x: '-100%',
    transition: { 
      type: 'spring', 
      stiffness: 400, 
      damping: 30,
      when: "afterChildren"
    } 
  },
};