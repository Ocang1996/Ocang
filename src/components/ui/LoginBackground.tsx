export const LoginBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100"></div>
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-blue-500/20 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-indigo-500/20 to-transparent"></div>
      
      {/* Decorative elements */}
      <div className="absolute -top-12 -left-12 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-56 -right-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-12 left-1/3 w-80 h-80 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(90deg, #000 1px, transparent 1px), linear-gradient(180deg, #000 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      ></div>
    </div>
  );
};