import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t py-3 text-center text-gray-600 text-sm">
      © {new Date().getFullYear()} Admin Dashboard — All rights reserved.
    </footer>
  );
};

export default Footer;
