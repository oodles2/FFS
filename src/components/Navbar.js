import Link from 'next/link';

const Layout = ({ children }) => {
  return (
    <div>
      <nav className="bg-gray-800 p-4">
        <ul className="flex space-x-4">
          <li>
            <Link href="/" className="text-white">
              Home
            </Link>
          </li>
          <li>
            <Link href="/matchups" className="text-white">
              Matchups
            </Link>
          </li>
          <li>
            <Link href="/rosters" className="text-white">
              Rosters
            </Link>
          </li>
          <li>
            <Link href="/draft-results" className="text-white">
              Draft Results
            </Link>
          </li>
        </ul>
      </nav>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
