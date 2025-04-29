import { 
  Brackets, 
  Github, 
  Twitter, 
  Linkedin,
  Mail,
  FileText,
  BookOpen,
  HelpCircle
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-8 md:mb-0">
            <div className="flex items-center mb-4">
              <Brackets className="bg-blue-500 text-black rounded p-0.5 h-6 w-6 mr-2" />
              <h2 className="text-xl font-bold text-gradient">Preflow</h2>
            </div>
            <p className="text-sm text-gray-400 max-w-md">
              Automate and streamline your data preprocessing workflow for machine learning and AI applications with our intelligent tools.
            </p>
            <div className="mt-6 flex space-x-5">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Resources</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-2 text-blue-400" />
                  <a href="#" className="text-sm text-gray-400 hover:text-blue-400 transition-colors">Documentation</a>
                </li>
                <li className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-blue-400" />
                  <a href="#" className="text-sm text-gray-400 hover:text-blue-400 transition-colors">API Reference</a>
                </li>
                <li className="flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2 text-blue-400" />
                  <a href="#" className="text-sm text-gray-400 hover:text-blue-400 transition-colors">Tutorials</a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-gray-400 hover:text-blue-400 transition-colors">About Us</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-blue-400 transition-colors">Contact</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-blue-400 transition-colors">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-gray-400 hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-blue-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-blue-400 transition-colors">Data Processing</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Preflow. All rights reserved.</p>
          <p className="text-sm text-gray-500 mt-4 md:mt-0">Built with 💙 for AI engineers and data scientists</p>
        </div>
      </div>
    </footer>
  );
}
