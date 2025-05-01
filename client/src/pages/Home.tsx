import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageUploader from "@/components/upload/ImageUploader";
import TabularDataUploader from "@/components/upload/TabularDataUploader";
import ImagePreprocessingOptions from "@/components/preprocessing/ImagePreprocessingOptions";
import TabularPreprocessingOptions from "@/components/preprocessing/TabularPreprocessingOptions";
import ResultsSection from "@/components/results/ResultsSection";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  ImageProcessingOptions,
  TabularProcessingOptions,
  imageProcessingOptionsSchema,
  tabularProcessingOptionsSchema,
} from "@shared/schema";
import { ProcessingState } from "@/lib/utils";

export type UploadedFile = {
  id: string;
  file: File;
  preview?: string;
};

export default function Home() {
  const { toast } = useToast();

  // Uploaded files state
  const [uploadedImages, setUploadedImages] = useState<UploadedFile[]>([]);
  const [uploadedTabularFiles, setUploadedTabularFiles] = useState<
    UploadedFile[]
  >([]);

  // Processing options state
  const [imageOptions, setImageOptions] = useState<ImageProcessingOptions>({
    resize: false,
    normalize: false,
    grayscale: false,
    noiseReduction: false,
    edgeDetection: false,
  });

  const [tabularOptions, setTabularOptions] =
    useState<TabularProcessingOptions>({
      missingValues: false,
      standardize: false,
      encodeCategorical: false,
      dropDuplicates: false,
      outlierDetection: false,
    });

  const [imageCustomParams, setImageCustomParams] = useState("");
  const [tabularCustomParams, setTabularCustomParams] = useState("");

  // Processing state
  const [processingState, setProcessingState] = useState<ProcessingState>(
    ProcessingState.IDLE
  );
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingResults, setProcessingResults] = useState<any>(null);

  // Handle processing data
  const processDataMutation = useMutation({
    mutationFn: async () => {
      if (uploadedImages.length === 0 && uploadedTabularFiles.length === 0) {
        throw new Error("Please upload at least one file to process");
      }

      const formData = new FormData();

      // Append image files
      uploadedImages.forEach((item) => {
        formData.append("imageFiles", item.file);
      });

      // Append tabular files
      uploadedTabularFiles.forEach((item) => {
        formData.append("tabularFiles", item.file);
      });

      // Append processing options
      const finalImageOptions = {
        ...imageOptions,
        customParameters: imageCustomParams,
      };

      const finalTabularOptions = {
        ...tabularOptions,
        customParameters: tabularCustomParams,
      };

      formData.append("imageOptions", JSON.stringify(finalImageOptions));
      formData.append("tabularOptions", JSON.stringify(finalTabularOptions));

      setProcessingState(ProcessingState.PROCESSING);

      // Mock progress updates
      const progressInterval = setInterval(() => {
        setProcessingProgress((prev) => {
          const newProgress = prev + Math.random() * 10;
          return newProgress >= 100 ? 100 : newProgress;
        });
      }, 300);

      try {
        const response = await fetch("/api/process", {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        clearInterval(progressInterval);
        setProcessingProgress(100);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || response.statusText);
        }

        const result = await response.json();
        return result;
      } catch (error) {
        clearInterval(progressInterval);
        throw error;
      }
    },
    onSuccess: (data) => {
      setProcessingState(ProcessingState.COMPLETED);
      setProcessingResults(data);
      toast({
        title: "Processing completed",
        description: "Your data has been successfully processed",
      });
    },
    onError: (error: Error) => {
      setProcessingState(ProcessingState.ERROR);
      toast({
        title: "Processing failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleProcessData = () => {
    processDataMutation.mutate();
  };

  const handleResetProcess = () => {
    setProcessingState(ProcessingState.IDLE);
    setProcessingProgress(0);
    setProcessingResults(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-dark-gradient min-h-screen">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto mb-20 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-float">
            <span className="text-gradient">
              Intelligent Data Preprocessing
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
            Automate the preparation of your data for machine learning models
            with our powerful, AI-driven preprocessing tools.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="flex items-center px-4 py-2 bg-black/40 backdrop-blur-sm rounded-full border border-blue-800/50">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
              <span className="text-gray-300 text-sm">
                Multiple file formats
              </span>
            </div>
            <div className="flex items-center px-4 py-2 bg-black/40 backdrop-blur-sm rounded-full border border-blue-800/50">
              <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></span>
              <span className="text-gray-300 text-sm">
                AI-powered optimizations
              </span>
            </div>
            <div className="flex items-center px-4 py-2 bg-black/40 backdrop-blur-sm rounded-full border border-blue-800/50">
              <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
              <span className="text-gray-300 text-sm">
                Customizable workflows
              </span>
            </div>
          </div>
        </section>

        {/* Upload Section */}
        <section className="max-w-7xl mx-auto mb-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold mb-4 text-white">
              Upload Your Data
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Upload images or tabular data for preprocessing with our advanced
              AI tools. We support multiple file formats for your convenience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <ImageUploader
              uploadedFiles={uploadedImages}
              setUploadedFiles={setUploadedImages}
            />
            <TabularDataUploader
              uploadedFiles={uploadedTabularFiles}
              setUploadedFiles={setUploadedTabularFiles}
            />
          </div>
        </section>

        {/* Preprocessing Options */}
        <section className="max-w-7xl mx-auto mb-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold mb-4 text-white">
              Preprocessing Options
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Configure the preprocessing techniques to apply to your data.
              Customize the workflows to meet your specific needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <ImagePreprocessingOptions
              options={imageOptions}
              setOptions={setImageOptions}
              customParams={imageCustomParams}
              setCustomParams={setImageCustomParams}
            />
            <TabularPreprocessingOptions
              options={tabularOptions}
              setOptions={setTabularOptions}
              customParams={tabularCustomParams}
              setCustomParams={setTabularCustomParams}
            />
          </div>

          <div className="mt-10 flex justify-center">
            <Button
              className="px-8 py-4 button-gradient text-white text-lg font-medium rounded-md hover:shadow-xl transition-all duration-300 focus:outline-none"
              onClick={handleProcessData}
              disabled={
                processDataMutation.isPending ||
                (uploadedImages.length === 0 &&
                  uploadedTabularFiles.length === 0)
              }
            >
              Process Data
            </Button>
          </div>
        </section>

        {/* Results Section */}
        <ResultsSection
          state={processingState}
          progress={processingProgress}
          results={processingResults}
          onReset={handleResetProcess}
          uploadedImages={uploadedImages}
          uploadedTabularFiles={uploadedTabularFiles}
        />
      </main>

      <Footer />
    </div>
  );
}
