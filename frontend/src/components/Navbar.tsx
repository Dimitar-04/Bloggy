function Navbar() {
  return (
    <nav className="border-b border-blue-950 bg-blue-950 text-white shadow-sm">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <a href="/" className="text-base font-semibold tracking-normal text-white">
          Bloggy
        </a>
      </div>
    </nav>
  );
}

export default Navbar;
