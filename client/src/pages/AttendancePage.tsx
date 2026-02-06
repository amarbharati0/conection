import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useAttendance, useMarkAttendance } from "@/hooks/use-attendance";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, RefreshCw } from "lucide-react";
import Webcam from "react-webcam";
import { useRef, useState, useCallback } from "react";
import { format } from "date-fns";

export default function AttendancePage() {
  const { user } = useAuth();
  const { data: records, isLoading } = useAttendance(user?.id);
  const markAttendance = useMarkAttendance();
  const webcamRef = useRef<Webcam>(null);
  
  const [mode, setMode] = useState<"view" | "capture">("view");
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [location, setLocation] = useState<string>("Locating...");

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImgSrc(imageSrc);
      if ("geolocation" in navigator) {
        // High accuracy for better verification
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
          },
          (error) => {
            console.error("Geolocation error:", error);
            switch(error.code) {
              case error.PERMISSION_DENIED:
                setLocation("Location Access Denied - Please enable in browser settings");
                break;
              case error.POSITION_UNAVAILABLE:
                setLocation("Location Unavailable");
                break;
              case error.TIMEOUT:
                setLocation("Location Timeout");
                break;
              default:
                setLocation("Location Error");
            }
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        setLocation("Geolocation Not Supported");
      }
    }
  }, [webcamRef]);

  const handleSubmit = () => {
    if (!imgSrc) return;
    
    markAttendance.mutate({
      candidateId: user!.id,
      livePhotoUrl: imgSrc,
      location: location,
    }, {
      onSuccess: () => {
        setMode("view");
        setImgSrc(null);
        setLocation("Locating...");
      }
    });
  };

  return (
    <Layout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display">Attendance</h1>
            <p className="text-muted-foreground mt-1">
              Verify your daily presence with a live photo.
            </p>
          </div>
          {mode === "view" && (
            <Button 
              size="lg" 
              className="gap-2 shadow-lg shadow-primary/25 rounded-xl"
              onClick={() => setMode("capture")}
            >
              <Camera className="w-5 h-5" />
              Check In Now
            </Button>
          )}
        </div>

        {mode === "capture" && (
          <Card className="overflow-hidden border-2 border-primary/20 animate-in zoom-in-95 duration-300">
            <CardContent className="p-0 relative bg-black aspect-video flex items-center justify-center">
              {imgSrc ? (
                <img src={imgSrc} alt="Captured" className="w-full h-full object-contain" />
              ) : (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover"
                />
              )}
            </CardContent>
            <div className="p-4 bg-card flex justify-center gap-4">
              {imgSrc ? (
                <>
                  <Button variant="outline" onClick={() => setImgSrc(null)}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Retake
                  </Button>
                  <Button onClick={handleSubmit} disabled={markAttendance.isPending}>
                    {markAttendance.isPending ? "Submitting..." : "Submit Attendance"}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => setMode("view")}>Cancel</Button>
                  <Button onClick={capture} className="gap-2">
                    <Camera className="w-4 h-4" /> Capture Photo
                  </Button>
                </>
              )}
            </div>
          </Card>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Recent Logs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {records?.map(record => (
              <Card key={record.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-square bg-muted relative group">
                  <img 
                    src={record.livePhotoUrl} 
                    alt="Attendance" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-3 left-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="font-bold">{format(new Date(record.timestamp), "HH:mm")}</p>
                    <p className="text-xs opacity-80">{format(new Date(record.timestamp), "MMMM d")}</p>
                    <p className="text-[10px] opacity-70 mt-1 truncate max-w-[120px]">{record.location}</p>
                  </div>
                </div>
              </Card>
            ))}
            
            {records?.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                No attendance records yet. Check in to get started!
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
