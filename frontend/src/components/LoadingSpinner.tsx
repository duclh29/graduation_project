const LoadingSpinner = ({ label = "Dang tai..." }: { label?: string }) => (
  <div className="flex items-center justify-center gap-3 py-10">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-mist border-t-terracotta" />
    <span className="text-sm font-medium text-slate-600">{label}</span>
  </div>
);

export default LoadingSpinner;
