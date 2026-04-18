import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ActionButton, ActionButtonGrid } from "@/components/home/ActionButton";
import { CenterTypeCard, CenterTypeGrid } from "@/components/home/CenterTypeCard";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pill,
  TestTube,
  Heart,
  Mail,
  Phone,
  Calendar,
  Stethoscope,
  MapPin,
  X as CrossIcon,
  Truck,
  Building2,
  Eye,
  HeartHandshake,
  ShoppingCart,
  Key,
  ScanLine,
} from "lucide-react";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [heroImageIndex, setHeroImageIndex] = React.useState(0);
  const heroImages = [
    "/images/doctor-patient.png",
    "/images/physical-exam.png",
    "/images/patient-care.png",
    "/images/vaccination.png",
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      {/* Header - Hidden on mobile landing page */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-900 via-blue-800 to-cyan-700 text-white py-12 pt-16 md:pt-28 pb-0 relative overflow-hidden">
        <div className="healthcare-container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12 min-h-[30rem]">
            <div className="w-full md:w-1/2 space-y-4 sm:space-y-6 text-center md:text-left z-20">
              <motion.h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Healthcare <motion.span
                  className="text-cyan-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >Without</motion.span> Boundaries
              </motion.h1>
              <motion.p
                className="text-base sm:text-lg md:text-xl text-cyan-50 max-w-lg mx-auto md:mx-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                Connect with the right healthcare providers for your needs, all in one platform.
              </motion.p>
              <motion.div
                className="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-4 pt-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.6 }}
              >
                {!isAuthenticated && (
                  <>
                    <Button
                      asChild
                      size="lg"
                      className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium px-8 shadow-lg"
                    >
                      <Link to="/auth/register">Get Started</Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium px-8 shadow-lg"
                    >
                      <Link to="/auth/login">Login</Link>
                    </Button>
                  </>
                )}
                {isAuthenticated && (
                  <Button
                    asChild
                    size="lg"
                    className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium px-8 shadow-lg"
                  >
                    <Link to="/dashboard">Go to Dashboard</Link>
                  </Button>
                )}
              </motion.div>
            </div>

            <div className="w-full md:w-1/2 relative h-[350px] sm:h-[450px] md:h-[550px] flex items-center justify-center">
              {/* Aggressive Masking Container to fade all edges */}
              {/* Aggressive Masking Container to fade all edges */}
              <div
                className="relative w-full h-full flex items-center justify-center overflow-hidden"
                style={{
                  maskImage: 'radial-gradient(ellipse at center, black 25%, rgba(0,0,0,0.5) 60%, transparent 85%), linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                  WebkitMaskImage: 'radial-gradient(ellipse at center, black 25%, rgba(0,0,0,0.5) 60%, transparent 85%), linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                  WebkitMaskComposite: 'source-in',
                  maskComposite: 'intersect'
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={heroImageIndex}
                    src={heroImages[heroImageIndex]}
                    alt="Healthcare"
                    className="absolute w-full h-full object-contain pointer-events-none z-10"
                    initial={{ opacity: 0, scale: 0.95, filter: "blur(10px) brightness(1.2)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px) brightness(1)" }}
                    exit={{ opacity: 0, scale: 1.05, filter: "blur(10px) brightness(0.8)" }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                </AnimatePresence>

                {/* Enhanced Atmosphere Hub behind the image */}
                <div className="absolute inset-0 bg-blue-400/20 blur-[100px] rounded-full z-0"></div>
                <div className="absolute inset-0 bg-cyan-500/10 blur-[60px] rounded-full z-0 transform scale-110"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="pt-10 pb-16 bg-gray-50 -mt-1 relative">
        {/* Desktop curved transition - hidden on mobile */}
        <div className="hidden md:block absolute top-0 left-0 right-0 h-24 overflow-hidden">
          <div className="w-full h-48 bg-gradient-to-br from-indigo-900 via-blue-800 to-cyan-700 rounded-b-[50%] transform translate-y-[-85%]"></div>
        </div>

        <div className="healthcare-container relative z-10 pt-8 sm:pt-12 md:pt-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Quick Actions</h2>
          <ActionButtonGrid>
            <ActionButton
              icon={Calendar}
              label="Book Service"
              href="/appointment"
              color="bg-healthcare-600"
            />
            <ActionButton
              icon={Truck}
              label="Call Ambulance"
              href="/emergency"
              color="bg-red-600"
            />
            <ActionButton
              icon={Pill}
              label="Buy Medication"
              href="/discovery?type=center&service=pharmacy"
              color="bg-teal-600"
            />
            <ActionButton
              icon={Stethoscope}
              label="Call a Doctor"
              href="/discovery?type=doctor&service=consultation"
              color="bg-indigo-600"
            />
            <ActionButton
              icon={TestTube}
              label="Diagnostics"
              href="/discovery?type=center&service=diagnostics"
              color="bg-amber-600"
            />
            <ActionButton
              icon={Heart}
              label="Cardiology Services"
              href="/discovery?service=cardiology"
              color="bg-red-600"
            />
            <ActionButton
              icon={Building2}
              label="Fitness Center Near You"
              href="/discovery?type=center&service=fitness"
              color="bg-orange-600"
            />
            <ActionButton
              icon={Heart}
              label="Blood Donation"
              href="/blood-donation"
              color="bg-pink-600"
            />
            <ActionButton
              icon={Eye}
              label="GET EYE LENSES"
              href="/discovery?service=vision"
              color="bg-purple-600"
            />
            <ActionButton
              icon={HeartHandshake}
              label="GET A CARE WORKER"
              href="/discovery?service=nursing"
              color="bg-rose-600"
            />

            <ActionButton
              icon={MapPin}
              label="Voluntary Service"
              href="/volunteer"
              color="bg-cyan-600"
            />
            <ActionButton
              icon={ScanLine}
              label="DICOM VIEWER"
              href="/dicom-viewer"
              color="bg-slate-800"
            />
          </ActionButtonGrid>
        </div>
      </section>

      {/* Healthcare Centers Section */}
      <section className="py-5 bg-white">
        <div className="healthcare-container">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Our Healthcare Centers</h2>
          <CenterTypeGrid>
            <CenterTypeCard
              icon={Building2}
              title="Hospitals"
              description="Full-service medical facilities providing emergency care, surgeries, and specialized treatments."
              href="/center/hospital"
            />
            <CenterTypeCard
              icon={Pill}
              title="Pharmacies"
              description="Dispensing medication, offering health advice, and providing essential healthcare products."
              href="/center/pharmacy"
              iconBgColor="bg-teal-100"
            />
            <CenterTypeCard
              icon={TestTube}
              title="Diagnostic Labs"
              description="Comprehensive testing services including blood work, imaging, and specialized screenings."
              href="/center/diagnostics"
              iconBgColor="bg-amber-100"
            />
            <CenterTypeCard
              icon={Heart}
              title="Cardiology Centers"
              description="Specialized care for heart-related conditions with advanced diagnostic capabilities."
              href="/center/cardiology"
              iconBgColor="bg-red-100"
            />
            <CenterTypeCard
              icon={CrossIcon}
              title="Emergency Services"
              description="24/7 emergency medical care for critical situations requiring immediate attention."
              href="/center/emergency"
              iconBgColor="bg-rose-100"
            />
            <CenterTypeCard
              icon={MapPin}
              title="Find Nearby Centers"
              description="Locate healthcare facilities in your area based on your current location."
              href="/centers/map"
              iconBgColor="bg-indigo-100"
            />
          </CenterTypeGrid>
        </div>
      </section>

      {/* Specialized Treatment Gallery Section */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="healthcare-container">
          <div className="text-center mb-16 px-4">
            <motion.h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Specialized Care & Treatments
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Experience high-quality healthcare delivery across all our specialized treatment departments, powered by advanced technology and expert professionals.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Regular Check-ups",
                description: "Comprehensive physical examinations tailored to your health needs.",
                image: "/images/physical-exam.png",
                color: "border-blue-500"
              },
              {
                title: "Vaccination & Immunity",
                description: "Stay protected with our modern immunisation and vaccination programs.",
                image: "/images/vaccination.png",
                color: "border-green-500"
              },
              {
                title: "Vision & Eye Care",
                description: "Precision eye examinations and advanced vision correction treatments.",
                image: "/images/vision-test.png",
                color: "border-purple-500"
              },
              {
                title: "In-patient Nursing",
                description: "Dedicated and compassionate nursing care for a comfortable recovery.",
                image: "/images/patient-care.png",
                color: "border-rose-500"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className={`group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border-b-4 ${item.color}`}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <div className="aspect-[4/5] relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                  <div className="absolute bottom-0 left-0 p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-200 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full border-blue-600 text-blue-600 hover:bg-blue-50 px-8"
            >
              <Link to="/center/hospital">Explore All Treatments</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}

      <section className="py-5 bg-gray-50">
        <div className="healthcare-container">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <img
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                  alt="Patient"
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-medium">Sarah Johnson</h4>
                  <p className="text-sm text-gray-600">Patient</p>
                </div>
              </div>
              <p className="text-gray-700">"This platform has revolutionized how I manage my healthcare. Finding specialists and booking services has never been easier."</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <img
                  src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                  alt="Doctor"
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-medium">Dr. Michael Chen</h4>
                  <p className="text-sm text-gray-600">Cardiologist</p>
                </div>
              </div>
              <p className="text-gray-700">"As a healthcare provider, this system helps me coordinate patient care efficiently while reducing administrative overhead."</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <img
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                  alt="Hospital Admin"
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-medium">Lisa Patel</h4>
                  <p className="text-sm text-gray-600">Hospital Administrator</p>
                </div>
              </div>
              <p className="text-gray-700">"This platform has streamlined our patient management and improved our service delivery. The analytics have been invaluable for our planning."</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 bg-healthcare-50 border-t">
        <div className="healthcare-container max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to manage your healthcare journey?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of patients and healthcare providers on our platform for seamless healthcare coordination.
            </p>
          </div>
          {!isAuthenticated && (
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Button asChild size="lg" className="px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all">
                <Link to="/auth/register">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="px-8 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                <Link to="/auth/login">Login</Link>
              </Button>
            </div>
          )}
          <div className="mt-12 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 space-y-4">
                <h3 className="text-xl font-bold">Download Our Mobile App</h3>
                <p className="text-muted-foreground">
                  Access your healthcare information on the go. Available for iOS and Android.
                </p>
                <div className="flex gap-4 pt-4">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                    alt="App Store" className="h-10" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                    alt="Google Play" className="h-10" />
                </div>
              </div>
              {/* <div className="bg-healthcare-100 flex items-center justify-center p-8">
                <img 
                  src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                  alt="Healthcare Mobile App" 
                  className="max-h-60 object-contain"
                />
              </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="healthcare-container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-4">Unlimited Healthcare</h3>
              <p className="text-gray-400">
                Connecting patients with healthcare providers for better coordination and care.
              </p>
              <div className="flex gap-4 pt-4">
                <a href="#" className="text-white hover:text-healthcare-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-healthcare-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-healthcare-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-healthcare-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
              </div>
            </div>

            {/* Services and Resources - side by side on mobile */}
            <div className="col-span-1 md:col-span-2">
              <div className="grid grid-cols-2 gap-8 md:gap-12">
                <div>
                  <h4 className="font-bold text-lg mb-4">Services</h4>
                  <ul className="space-y-3 text-gray-400">
                    <li><a href="#" className="hover:text-white transition-colors">Find a Doctor</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Book Service</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Emergency Services</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Medical Records</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Telemedicine</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-4">Resources</h4>
                  <ul className="space-y-3 text-gray-400">
                    <li><a href="#" className="hover:text-white transition-colors">For Patients</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">For Doctors</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">For Facilities</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Contact</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center">
                  <Phone className="h-5 w-5 mr-3 text-healthcare-500" />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center">
                  <Mail className="h-5 w-5 mr-3 text-healthcare-500" />
                  <span>contact@unlimitedhealthcare.com</span>
                </li>
                <li className="flex items-center">
                  <MapPin className="h-5 w-5 mr-3 text-healthcare-500" />
                  <span>Federal housing New layout North bank Makurdi</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm flex flex-col md:flex-row justify-center items-center gap-4">
            <span>&copy; {new Date().getFullYear()} Unlimited Healthcare. All rights reserved.</span>
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div >
  );
};

export default Home;
