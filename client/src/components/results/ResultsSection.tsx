import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Eye, 
  Download, 
  Clock, 
  FileText, 
  Upload, 
  FileSpreadsheet, 
  RotateCcw, 
  AlertCircle
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ProcessingState } from "@/lib/utils";
import { UploadedFile } from "@/pages/Home";

interface ResultsSectionProps {
  state: ProcessingState;
  progress: number;
  results: any;
  onReset: () => void;
  uploadedImages: UploadedFile[];
  uploadedTabularFiles: UploadedFile[];
}

export default function ResultsSection({ 
  state, 
  progress, 
  results, 
  onReset,
  uploadedImages,
  uploadedTabularFiles
}: ResultsSectionProps) {
  
  // Helper function to convert bytes to readable format
  const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };
  
  // Calculate total data size
  const calculateTotalSize = () => {
    const imagesSize = uploadedImages.reduce((total, item) => total + item.file.size, 0);
    const tabularSize = uploadedTabularFiles.reduce((total, item) => total + item.file.size, 0);
    return formatBytes(imagesSize + tabularSize);
  };
  
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Processing Results</h2>
        <p className="text-gray-600">View and download your processed data files.</p>
      </div>
      
      {/* Processing State */}
      {state === ProcessingState.PROCESSING && (
        <Card className="bg-white rounded-lg shadow">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-lg font-medium mb-2">Processing Your Data</h3>
            <p className="text-gray-500 mb-4">This may take a few moments depending on the size of your data.</p>
            <div className="w-full max-w-md mx-auto mb-4">
              <Progress value={progress} className="h-2.5" />
            </div>
            <p className="text-sm text-gray-500">{Math.round(progress)}% complete</p>
          </CardContent>
        </Card>
      )}
      
      {/* Error State */}
      {state === ProcessingState.ERROR && (
        <Card className="bg-white rounded-lg shadow">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-medium mb-2 text-red-600">Processing Error</h3>
            <p className="text-gray-500 mb-6">We encountered an error while processing your data. Please try again or check your files.</p>
            <Button 
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              onClick={onReset}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Results Display */}
      {state === ProcessingState.COMPLETED && results && (
        <div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image Results */}
            {uploadedImages.length > 0 && (
              <Card className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h3 className="text-lg font-medium">Processed Images</h3>
                </div>
                
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {uploadedImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <div className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-md overflow-hidden shadow-sm">
                          {image.preview && (
                            <img 
                              src={image.preview} 
                              alt={image.file.name} 
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                          <button className="p-2 bg-white rounded-full mr-2">
                            <Eye className="h-4 w-4 text-gray-700" />
                          </button>
                          <button className="p-2 bg-white rounded-full">
                            <Download className="h-4 w-4 text-gray-700" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      className="px-4 py-2 text-sm bg-gray-100 text-gray-800 font-medium rounded-md hover:bg-gray-200"
                    >
                      <Eye className="h-4 w-4 mr-1" /> Preview All
                    </Button>
                    <Button 
                      className="px-4 py-2 text-sm bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700"
                    >
                      <Download className="h-4 w-4 mr-1" /> Download All
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Tabular Results */}
            {uploadedTabularFiles.length > 0 && (
              <Card className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h3 className="text-lg font-medium">Processed Tabular Data</h3>
                </div>
                
                <CardContent className="p-6">
                  <div className="mb-6 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Column 1</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Column 2</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Column 3</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 text-sm">
                        <tr>
                          <td className="px-3 py-2 whitespace-nowrap">1.245</td>
                          <td className="px-3 py-2 whitespace-nowrap">0.887</td>
                          <td className="px-3 py-2 whitespace-nowrap">Category A</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 whitespace-nowrap">2.318</td>
                          <td className="px-3 py-2 whitespace-nowrap">0.548</td>
                          <td className="px-3 py-2 whitespace-nowrap">Category B</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 whitespace-nowrap">0.943</td>
                          <td className="px-3 py-2 whitespace-nowrap">1.223</td>
                          <td className="px-3 py-2 whitespace-nowrap">Category A</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      className="px-4 py-2 text-sm bg-gray-100 text-gray-800 font-medium rounded-md hover:bg-gray-200"
                    >
                      <FileText className="h-4 w-4 mr-1" /> View Report
                    </Button>
                    <div>
                      <Button 
                        variant="outline" 
                        className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 mr-2"
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-1" /> CSV
                      </Button>
                      <Button 
                        className="px-4 py-2 text-sm bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700"
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-1" /> Excel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          <Card className="mt-8 bg-white rounded-lg shadow">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Processing Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                      <Clock className="h-4 w-4 text-primary-600" />
                    </div>
                    <span className="text-sm font-medium">Processing Time</span>
                  </div>
                  <p className="text-2xl font-semibold">{results.processingTime || '0.0'}s</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <FileText className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium">Files Processed</span>
                  </div>
                  <p className="text-2xl font-semibold">{uploadedImages.length + uploadedTabularFiles.length}</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <Upload className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium">Data Size</span>
                  </div>
                  <p className="text-2xl font-semibold">{calculateTotalSize()}</p>
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                <p>All preprocessing operations completed successfully. Your data is now ready for machine learning or further analysis.</p>
              </div>
              
              <div className="mt-6 flex justify-center">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={onReset}
                >
                  <RotateCcw className="h-4 w-4" />
                  Process More Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
}
