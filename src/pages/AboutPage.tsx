import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start py-12 px-6">
      <div className="max-w-4xl w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-[#065C64] mb-6">About Us</h1>
        
        <p className="text-gray-700 text-lg mb-6">
          Welcome to <span className="font-semibold text-[#065C64]">PlayDay</span>! 🚀
        </p>

        <p className="text-gray-600 mb-4">
          Our mission is to connect players and owners in an easy and efficient way, providing the best experience
          for both parties. We believe that finding a place to play or managing your venue should be simple, fast, and enjoyable.
        </p>

        <p className="text-gray-600 mb-4">
          Behind the platform is a passionate team dedicated to innovation, user satisfaction, and creating a vibrant sports community.
          We continuously strive to bring new features and improvements that make your experience even better.
        </p>

        <h2 className="text-2xl font-semibold text-[#065C64] mt-8 mb-4">Our Values</h2>
        <ul className="list-disc list-inside text-gray-600 space-y-2">
          <li>⚡ Simplicity and speed in every interaction</li>
          <li>💬 Clear communication and strong community support</li>
          <li>🌱 Continuous growth and innovation</li>
          <li>🤝 Respect and collaboration between users</li>
        </ul>

        <div className="mt-10 text-center">
          <p className="text-gray-700 mb-4">
            Want to get in touch? We'd love to hear from you!
          </p>
          <a
            href="/contact"
            className="inline-block bg-[#065C64] text-white py-2 px-6 rounded-lg hover:bg-[#044E4F] transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
