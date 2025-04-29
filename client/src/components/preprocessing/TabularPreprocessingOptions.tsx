import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table as TableIcon } from "lucide-react";
import { TabularProcessingOptions } from "@shared/schema";

interface OptionItemProps {
  title: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
  id: string;
}

function OptionItem({ title, description, checked, onToggle, id }: OptionItemProps) {
  return (
    <div className="processing-option flex items-center justify-between py-3 px-2 rounded-lg hover:bg-indigo-900/10 transition-colors">
      <div>
        <h4 className="text-sm font-medium mb-1 text-gray-200">{title}</h4>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
      <div className="flex items-center">
        <Switch 
          id={id} 
          checked={checked} 
          onCheckedChange={onToggle}
          className="data-[state=checked]:bg-indigo-600" 
        />
      </div>
    </div>
  );
}

interface TabularPreprocessingOptionsProps {
  options: TabularProcessingOptions;
  setOptions: React.Dispatch<React.SetStateAction<TabularProcessingOptions>>;
  customParams: string;
  setCustomParams: React.Dispatch<React.SetStateAction<string>>;
}

export default function TabularPreprocessingOptions({ 
  options, 
  setOptions,
  customParams,
  setCustomParams
}: TabularPreprocessingOptionsProps) {
  
  const updateOption = (option: keyof TabularProcessingOptions) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  return (
    <Card className="card-dark">
      <div className="border-b border-gray-800 px-6 py-4 flex items-center">
        <div className="bg-indigo-500/20 rounded-full p-2 mr-3">
          <TableIcon className="text-indigo-400 h-5 w-5" />
        </div>
        <h3 className="text-lg font-medium text-white">Tabular Data Processing Options</h3>
      </div>
      
      <CardContent className="p-6 space-y-5">
        <OptionItem
          id="missingValues"
          title="Handle Missing Values"
          description="Fill or remove missing data points"
          checked={options.missingValues}
          onToggle={() => updateOption('missingValues')}
        />
        
        <OptionItem
          id="standardize"
          title="Standardize Numerical Features"
          description="Scale numerical data to have zero mean and unit variance"
          checked={options.standardize}
          onToggle={() => updateOption('standardize')}
        />
        
        <OptionItem
          id="encodeCategorical"
          title="Encode Categorical Variables"
          description="Convert categorical data to numerical representation"
          checked={options.encodeCategorical}
          onToggle={() => updateOption('encodeCategorical')}
        />
        
        <OptionItem
          id="dropDuplicates"
          title="Drop Duplicates"
          description="Remove duplicate rows from the dataset"
          checked={options.dropDuplicates}
          onToggle={() => updateOption('dropDuplicates')}
        />
        
        <OptionItem
          id="outlierDetection"
          title="Outlier Detection"
          description="Identify and handle statistical outliers"
          checked={options.outlierDetection}
          onToggle={() => updateOption('outlierDetection')}
        />
        
        <div className="pt-5 border-t border-gray-800">
          <Label htmlFor="tabular-custom-params" className="block text-sm font-medium text-gray-200 mb-2">
            Custom Parameters
          </Label>
          <Textarea
            id="tabular-custom-params"
            className="w-full h-24 bg-gray-900/50 border-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Add any custom preprocessing parameters here (JSON format)"
            value={customParams}
            onChange={(e) => setCustomParams(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
