function Navbar() {
  return (
    <nav className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <a href="/" className="text-base font-semibold text-zinc-950">
          Bloggy
        </a>
        <div className="flex items-center gap-5 text-sm text-zinc-600">
          <a href="#posts" className="hover:text-zinc-950">
            Posts
          </a>
          <a href="#create" className="hover:text-zinc-950">
            New post
          </a>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
