const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen w-full">

      <main className="w-full">
        {children}
      </main>

    </div>
  );
};

export default MainLayout;