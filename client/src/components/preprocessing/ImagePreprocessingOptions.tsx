import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ImageProcessingOptions } from "@shared/schema";
import { ImageIcon } from "lucide-react";

interface OptionItemProps {
  title: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
  id: string;
}

function OptionItem({ title, description, checked, onToggle, id }: OptionItemProps) {
  return (
    <div className="processing-option flex items-center justify-between py-3 px-2 rounded-lg hover:bg-blue-900/10 transition-colors">
      <div>
        <h4 className="text-sm font-medium mb-1 text-gray-200">{title}</h4>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
      <div className="flex items-center">
        <Switch 
          id={id} 
          checked={checked} 
          onCheckedChange={onToggle}
          className="data-[state=checked]:bg-blue-600" 
        />
      </div>
    </div>
  );
}

interface ImagePreprocessingOptionsProps {
  options: ImageProcessingOptions;
  setOptions: React.Dispatch<React.SetStateAction<ImageProcessingOptions>>;
  customParams: string;
  setCustomParams: React.Dispatch<React.SetStateAction<string>>;
}

export default function ImagePreprocessingOptions({ 
  options, 
  setOptions,
  customParams,
  setCustomParams
}: ImagePreprocessingOptionsProps) {
  
  const updateOption = (option: keyof ImageProcessingOptions) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  return (
    <Card className="card-dark">
      <div className="border-b border-gray-800 px-6 py-4 flex items-center">
        <div className="bg-blue-500/20 rounded-full p-2 mr-3">
          <ImageIcon className="text-blue-400 h-5 w-5" />
        </div>
        <h3 className="text-lg font-medium text-white">Image Processing Options</h3>
      </div>
      
      <CardContent className="p-6 space-y-5">
        <OptionItem
          id="resize"
          title="Resize Images"
          description="Resize all images to a standard dimension"
          checked={options.resize}
          onToggle={() => updateOption('resize')}
        />
        
        <OptionItem
          id="normalize"
          title="Normalize Colors"
          description="Standardize color ranges across all images"
          checked={options.normalize}
          onToggle={() => updateOption('normalize')}
        />
        
        <OptionItem
          id="grayscale"
          title="Convert to Grayscale"
          description="Convert colored images to grayscale"
          checked={options.grayscale}
          onToggle={() => updateOption('grayscale')}
        />
        
        <OptionItem
          id="noiseReduction"
          title="Apply Noise Reduction"
          description="Remove noise artifacts from images"
          checked={options.noiseReduction}
          onToggle={() => updateOption('noiseReduction')}
        />
        
        <OptionItem
          id="edgeDetection"
          title="Edge Detection"
          description="Highlight edges in the images"
          checked={options.edgeDetection}
          onToggle={() => updateOption('edgeDetection')}
        />
        
        <div className="pt-5 border-t border-gray-800">
          <Label htmlFor="image-custom-params" className="block text-sm font-medium text-gray-200 mb-2">
            Custom Parameters
          </Label>
          <Textarea
            id="image-custom-params"
            className="w-full h-24 bg-gray-900/50 border-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add any custom preprocessing parameters here (JSON format)"
            value={customParams}
            onChange={(e) => setCustomParams(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
