import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, Upload, X, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadedFile } from "@/pages/Home";
import { useToast } from "@/hooks/use-toast";

interface TabularDataUploaderProps {
  uploadedFiles: UploadedFile[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
}

export default function TabularDataUploader({ uploadedFiles, setUploadedFiles }: TabularDataUploaderProps) {
  const { toast } = useToast();
  const [isDragOver, setIsDragOver] = useState(false);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);
  
  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);
  
  const validateTabularFile = (file: File): boolean => {
    // Check file type
    const validTypes = [
      'text/csv', 
      'application/vnd.ms-excel', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/octet-stream' // For some CSV files
    ];
    
    // Also check file extension
    const validExtensions = ['.csv', '.xls', '.xlsx'];
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    
    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      toast({
        title: "Invalid file type",
        description: "Only CSV, XLS, and XLSX files are supported",
        variant: "destructive",
      });
      return false;
    }
    
    // Check file size (100MB max)
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Maximum file size is 100MB",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  const processFiles = useCallback((files: FileList) => {
    const newFiles: UploadedFile[] = [];
    
    Array.from(files).forEach(file => {
      if (validateTabularFile(file)) {
        const fileId = crypto.randomUUID();
        newFiles.push({ id: fileId, file });
      }
    });
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, [setUploadedFiles, toast]);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);
  
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      // Reset the input value so the same file can be selected again
      e.target.value = '';
    }
  }, [processFiles]);
  
  const handleRemoveFile = useCallback((id: string) => {
    setUploadedFiles(prev => {
      const newFiles = prev.filter(file => file.id !== id);
      return newFiles;
    });
  }, [setUploadedFiles]);
  
  return (
    <Card className="card-dark overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center mb-6">
          <div className="bg-indigo-500/20 rounded-full p-2 mr-3">
            <Table className="text-indigo-400 h-5 w-5" />
          </div>
          <h3 className="text-xl font-medium text-white">Tabular Data Preprocessing</h3>
        </div>
        
        <div 
          className={`border-2 border-dashed border-gray-700 h-52 rounded-xl flex flex-col justify-center items-center p-6 mb-6 transition-all ${isDragOver ? 'border-indigo-500/70 bg-indigo-900/10' : 'hover:border-indigo-500/30 hover:bg-indigo-900/5'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-10 w-10 text-indigo-400 mb-4 opacity-80" />
          <p className="text-base text-gray-300 text-center mb-2 font-medium">Drag and drop your data files here</p>
          <p className="text-sm text-gray-400 text-center mb-6">Supports: CSV, XLSX, XLS (max 100MB)</p>
          
          <label htmlFor="tabular-upload">
            <Button 
              variant="outline" 
              className="bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 transition-colors"
            >
              Browse Files
            </Button>
          </label>
          <input 
            id="tabular-upload" 
            type="file" 
            accept=".csv,.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv" 
            className="hidden" 
            multiple 
            onChange={handleFileInput} 
          />
        </div>
        
        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            {uploadedFiles.map(file => (
              <div key={file.id} className="flex items-center justify-between bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-black flex-shrink-0 mr-4 flex items-center justify-center border border-gray-700">
                    <FileSpreadsheet className="text-indigo-400 h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200">{file.file.name}</p>
                    <p className="text-xs text-gray-400">{(file.file.size / (1024 * 1024)).toFixed(2)}MB</p>
                  </div>
                </div>
                <button 
                  className="text-gray-400 hover:text-red-400 transition-colors p-1 rounded-full hover:bg-gray-700/50"
                  onClick={() => handleRemoveFile(file.id)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
