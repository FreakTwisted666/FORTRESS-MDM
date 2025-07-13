import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, QrCode, Users, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { QRCodeGenerator } from "./qr-code-generator";

interface BulkEnrollmentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BulkEnrollment({ open, onOpenChange }: BulkEnrollmentProps) {
  const [enrollmentMethod, setEnrollmentMethod] = useState<"csv" | "qr" | "manual">("csv");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [csvData, setCsvData] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [qrCodes, setQrCodes] = useState<string[]>([]);

  const sampleCsvData = `Device Name,IMEI,Serial Number,Device Type,Location,Department
Samsung Galaxy Tab A8,352033111234567,,android,New York Office,IT
iPad Pro 11-inch,,DLXKXXXXX,ios,San Francisco Office,Sales
Google Pixel 7,352033111234568,,android,Chicago Office,Marketing
Surface Pro 9,,SP9SERIAL001,windows,Remote,Engineering`;

  const handleCsvUpload = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvData(content);

      // Simulate processing progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);

        if (progress >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          toast({
            title: "CSV Processed",
            description: "Device list has been validated and is ready for enrollment.",
          });
        }
      }, 200);
    };

    reader.readAsText(file);
  };

  const handleBulkEnrollment = async () => {
    setIsProcessing(true);
    setUploadProgress(0);

    try {
      // Simulate processing
      const totalSteps = 4;
      for (let i = 0; i <= totalSteps; i++) {
        setUploadProgress((i / totalSteps) * 100);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast({
        title: "Success",
        description: "Devices enrolled successfully.",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enroll devices.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateQRCodes = () => {
    const serverUrl = window.location.origin;
    const enrollmentCode = process.env.MDM_ENROLLMENT_CODE || "DEMO-CODE-123";

    // Generate QR codes for different device types/locations
    const qrData = [
      JSON.stringify({
        serverUrl,
        enrollmentCode,
        deviceType: "android",
        location: "Main Office"
      }),
      JSON.stringify({
        serverUrl,
        enrollmentCode,
        deviceType: "android",
        location: "Branch Office"
      }),
      JSON.stringify({
        serverUrl,
        enrollmentCode,
        deviceType: "ios",
        location: "Main Office"
      }),
      JSON.stringify({
        serverUrl,
        enrollmentCode,
        deviceType: "android",
        location: "Remote"
      })
    ];

    setQrCodes(qrData);

    toast({
      title: "QR Codes Generated",
      description: "QR codes are ready for device enrollment.",
    });
  };

  const downloadTemplate = () => {
    const element = document.createElement("a");
    const file = new Blob([sampleCsvData], { type: "text/csv" });
    element.href = URL.createObjectURL(file);
    element.download = "device_enrollment_template.csv";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users size={20} />
            <span>Bulk Device Enrollment</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={enrollmentMethod} onValueChange={(value) => setEnrollmentMethod(value as typeof enrollmentMethod)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="csv">CSV Import</TabsTrigger>
            <TabsTrigger value="qr">QR Code Generation</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>

          <TabsContent value="csv" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Upload CSV File</Label>
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleCsvUpload(file);
                      }
                    }}
                    disabled={isProcessing}
                  />
                  <p className="text-sm text-gray-500">
                    Upload a CSV file with device information
                  </p>
                </div>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">CSV Template</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadTemplate}
                      >
                        <Download className="mr-2" size={16} />
                        Download
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Download the template to ensure proper formatting
                    </p>
                  </CardContent>
                </Card>

                {uploadProgress > 0 && (
                  <div className="space-y-2">
                    <Label>Processing Progress</Label>
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-gray-500">{uploadProgress}% complete</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Label>Preview Data</Label>
                <Textarea
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  placeholder="CSV data will appear here..."
                  rows={10}
                  readOnly={!csvData}
                />

                {csvData && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="text-green-600 dark:text-green-400" size={16} />
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Found 4 devices ready for enrollment
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {csvData && (
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBulkEnrollment} disabled={isProcessing}>
                  {isProcessing ? "Enrolling Devices..." : "Enroll All Devices"}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="qr" className="space-y-4">
            <div className="text-center py-8">
              {qrCodes.length === 0 ? (
                <>
                  <QrCode className="mx-auto text-gray-400 mb-4" size={64} />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    QR Code Bulk Enrollment
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Generate QR codes for multiple device enrollment
                  </p>
                  <Button onClick={handleGenerateQRCodes}>
                    <QrCode className="mr-2" size={16} />
                    Generate QR Codes
                  </Button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {qrCodes.map((qrCode, index) => (
                    <div key={index} className="p-4 border rounded-md">
                      <QRCodeGenerator value={qrCode} size={128} />
                      <p className="text-sm text-gray-500 mt-2">
                        QR Code {index + 1}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="text-center py-8">
              <FileText className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Manual Bulk Entry
              </h3>
              <p className="text-gray-500 mb-4">
                Manually enter multiple device information
              </p>
              <Button>
                <Users className="mr-2" size={16} />
                Start Manual Entry
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}