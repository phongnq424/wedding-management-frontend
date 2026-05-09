import React, { useState } from "react";
import { Sparkles } from "lucide-react";

// Layout components
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";

// Screen components
import { DashboardScreen } from "./components/screens/DashboardScreen";
import { HallListScreen, HallFormScreen } from "./components/screens/HallScreens";
import { HallTypeListScreen, HallTypeFormScreen } from "./components/screens/HallTypeScreens";
import { ShiftListScreen, ShiftFormScreen } from "./components/screens/ShiftScreens";
import { ServiceListScreen, ServiceFormScreen } from "./components/screens/ServiceScreens";
import {
  BookingScreen,
  CheckHallAvailabilityScreen,
  BookingFormScreen,
} from "./components/screens/BookingScreens";

import { PaymentScreen, InvoiceScreen } from "./components/screens/FinanceScreens";
import { DishTypeListScreen } from "./components/screens/DishTypeScreen";
import { DishListScreen } from "./components/screens/DishScreen";
import { DishComboListScreen } from "./components/screens/DishComboScreen";
import { PackageListScreen, PackageFormScreen } from "./components/screens/PackageScreens";
import {
  MenuScreen,
  StaffScreen,
  RolesScreen,
  ReportsScreen,
  AuditScreen,
  SettingsScreen,
} from "./components/screens/MiscScreens";

// Types and initial data
import { Screen, Role, WeddingPackage } from "./types";
import { DISH_TYPES_INIT, DISHES_INIT, DISH_COMBOS_INIT, WEDDING_PACKAGES_INIT } from "./data";

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<Role>("Operations Manager");

  // Selection state for form screens
  const [selectedHall, setSelectedHall] = useState<number | null>(null);
  const [selectedHallType, setSelectedHallType] = useState<number | null>(null);
  const [selectedShift, setSelectedShift] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);

  // Module data state
  const [dishTypes, setDishTypes] = useState(DISH_TYPES_INIT);
  const [dishes, setDishes] = useState(DISHES_INIT);
  const [dishCombos, setDishCombos] = useState(DISH_COMBOS_INIT);
  const [packages, setPackages] = useState<WeddingPackage[]>(WEDDING_PACKAGES_INIT as WeddingPackage[]);

  // Booking pre-selection (from Check Availability → Booking Form)
  const [bookingPreselect, setBookingPreselect] = useState<{
    hallName: string; hallId: number; date: string; shift: string;
  } | null>(null);

  // UI state
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [show2FA, setShow2FA] = useState(false);

  // ── Login Screen ──────────────────────────────────────────────────────────
  const LoginScreen = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f9f7f4] via-[#faf8f5] to-[#f5f2ed] p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#c9a961] to-[#b89851] mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-semibold text-primary mb-2">Wedding Center</h1>
          <p className="text-muted-foreground">Management System</p>
        </div>

        {!show2FA ? (
          <div className="bg-card rounded-[24px] shadow-lg p-8 border border-border">
            <h2 className="text-2xl font-semibold text-primary mb-6">Sign In</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email Address <span className="text-destructive">*</span></label>
                <input type="email" placeholder="your.email@wedding.vn" className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all" defaultValue="tuan.tran@wedding.vn" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Password <span className="text-destructive">*</span></label>
                <input type="password" placeholder="Enter your password" className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all" />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-border text-accent focus:ring-accent" />
                  <span className="ml-2 text-sm text-muted-foreground">Remember me</span>
                </label>
                <button className="text-sm text-accent hover:text-accent/80 transition-colors">Forgot password?</button>
              </div>
              <button onClick={() => setShow2FA(true)} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all shadow-sm">Sign In</button>
            </div>
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-center text-muted-foreground">Authorized access only. All activities are monitored and logged.</p>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-[24px] shadow-lg p-8 border border-border">
            <h2 className="text-2xl font-semibold text-primary mb-2">Two-Factor Authentication</h2>
            <p className="text-sm text-muted-foreground mb-6">Enter the 6-digit code from your authenticator app</p>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Authentication Code <span className="text-destructive">*</span></label>
                <input type="text" placeholder="000000" maxLength={6} className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent transition-all text-center text-2xl tracking-widest font-mono" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShow2FA(false)} className="flex-1 py-3 border border-border text-foreground rounded-xl font-medium hover:bg-secondary transition-all">Back</button>
                <button onClick={() => { setIsLoggedIn(true); setScreen("dashboard"); }} className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all shadow-sm">Verify</button>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-border">
              <button className="text-sm text-accent hover:text-accent/80 transition-colors w-full text-center">Having trouble? Contact administrator</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (!isLoggedIn) return <LoginScreen />;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar screen={screen} setScreen={setScreen} userRole={userRole} />
      <Header
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        userRole={userRole}
        setIsLoggedIn={setIsLoggedIn}
        setScreen={setScreen}
      />

      <main className="ml-64 pt-16">
        <div className="p-6">
          {screen === "dashboard" && <DashboardScreen setScreen={setScreen} />}

          {/* Hall screens */}
          {screen === "hall-list" && <HallListScreen setSelectedHall={setSelectedHall} setScreen={setScreen} showPriceModal={showPriceModal} setShowPriceModal={setShowPriceModal} selectedHall={selectedHall} />}
          {screen === "hall-form" && <HallFormScreen selectedHall={selectedHall} setScreen={setScreen} />}

          {/* Hall Type screens */}
          {screen === "hall-type-list" && <HallTypeListScreen setSelectedHallType={setSelectedHallType} setScreen={setScreen} />}
          {screen === "hall-type-form" && <HallTypeFormScreen selectedHallType={selectedHallType} setScreen={setScreen} />}

          {/* Shift screens */}
          {screen === "shift-list" && <ShiftListScreen setSelectedShift={setSelectedShift} setScreen={setScreen} />}
          {screen === "shift-form" && <ShiftFormScreen selectedShift={selectedShift} setScreen={setScreen} />}

          {/* Service screens */}
          {screen === "service-list" && <ServiceListScreen setSelectedService={setSelectedService} setScreen={setScreen} />}
          {screen === "service-form" && <ServiceFormScreen selectedService={selectedService} setScreen={setScreen} />}

          {/* Booking screens */}
          {screen === "booking" && <BookingScreen setScreen={setScreen} />}
          {screen === "booking-availability" && (
            <CheckHallAvailabilityScreen
              setScreen={setScreen}
              setBookingPreselect={setBookingPreselect}
            />
          )}
          {screen === "booking-form" && (
            <BookingFormScreen
              setScreen={setScreen}
              bookingPreselect={bookingPreselect}
              packages={packages}
            />
          )}
          {/* Finance screens */}
          {screen === "payment" && <PaymentScreen />}
          {screen === "invoice" && <InvoiceScreen />}

          {/* Dish / Menu screens */}
          {screen === "dish-type-list" && <DishTypeListScreen dishTypes={dishTypes} setDishTypes={setDishTypes} />}
          {screen === "dish-list" && <DishListScreen dishes={dishes} setDishes={setDishes} dishTypes={dishTypes} />}
          {screen === "dish-combo-list" && <DishComboListScreen dishCombos={dishCombos} setDishCombos={setDishCombos} dishes={dishes} dishTypes={dishTypes} />}

          {/* Package screens */}
          {screen === "package-list" && (
            <PackageListScreen
              setScreen={setScreen}
              packages={packages}
              setPackages={setPackages}
              selectedPackage={selectedPackage}
              setSelectedPackage={setSelectedPackage}
            />
          )}
          {screen === "package-form" && (
            <PackageFormScreen
              setScreen={setScreen}
              packages={packages}
              setPackages={setPackages}
              selectedPackage={selectedPackage}
              setSelectedPackage={setSelectedPackage}
            />
          )}

          {/* Misc screens */}
          {screen === "menu" && <MenuScreen />}
          {screen === "staff" && <StaffScreen />}
          {screen === "roles" && <RolesScreen userRole={userRole} setUserRole={setUserRole} />}
          {screen === "reports" && <ReportsScreen />}
          {screen === "audit" && <AuditScreen />}
          {screen === "settings" && <SettingsScreen />}
        </div>
      </main>
    </div>
  );
}