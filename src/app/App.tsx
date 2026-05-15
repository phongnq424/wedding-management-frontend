import { useState } from "react";
import { useAuth } from "./context/AuthContext";

// Layout components
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";

// Auth components
import { LoginForm } from "./components/screens/LoginForm";
import { TwoFAForm } from "./components/screens/TwoFAForm";

// Screen components
import { DashboardScreen } from "./components/screens/DashboardScreen";
import { HallListScreen, HallFormScreen } from "./components/screens/hall";
import {
  HallTypeListScreen,
  HallTypeFormScreen,
} from "./components/screens/hallType";
import { ShiftListScreen, ShiftFormScreen } from "./components/screens/ShiftScreens";
import { ServiceListScreen, ServiceFormScreen } from "./components/screens/ServiceScreens";
import {
  BookingScreen,
  CheckHallAvailabilityScreen,
  BookingFormScreen,
  type BookingPreselect,
} from "./components/screens/booking";

import { PaymentScreen, InvoiceScreen } from "./components/screens/finance";
import { DishTypeListScreen } from "./components/screens/DishTypeScreen";
import { DishListScreen } from "./components/screens/DishScreen";
import { BeverageTypeListScreen } from "./components/screens/BeverageTypeScreen";
import { BeverageListScreen } from "./components/screens/BeverageScreen";
import { DishComboListScreen } from "./components/screens/DishComboScreen";
import { PackageListScreen, PackageFormScreen } from "./components/screens/PackageScreens";
import {
  StaffScreen,
  ReportsScreen,
  AuditScreen,
  SettingsScreen,
} from "./components/screens/MiscScreens";

import { RolesScreen } from "./components/screens/RoleScreen";

// Types and initial data
import { Screen, Role } from "./types";
import { authService } from "./services/authService";

export default function App() {
  const { isLoggedIn, login, verify2FA, logout, isLoading, error, requires2FA, user } = useAuth();
  const [screen, setScreen] = useState<Screen>("login");
  const [userRole, setUserRole] = useState<Role>("Operations Manager");

  // Login form state
  const [email, setEmail] = useState("admin@wedding.local");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  // 2FA form state
  const [twoFACode, setTwoFACode] = useState("");

  // Selection state for form screens
  const [selectedHall, setSelectedHall] = useState<string | null>(null);
  const [selectedHallType, setSelectedHallType] = useState<string | null>(null);
  const [selectedShift, setSelectedShift] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);


  // Booking pre-selection (from Check Availability → Booking Form)
  const [bookingPreselect, setBookingPreselect] =
    useState<BookingPreselect | null>(null);

  // UI state
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // ── Login Handlers ──────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!email || !password) {
      setLoginError("Vui lòng nhập email và password");
      return;
    }

    try {
      await login({ email, password });
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    }
  };

  const handle2FAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    
    if (!twoFACode || twoFACode.length !== 6) {
      setLoginError("Vui lòng nhập mã 6 số");
      return;
    }

    const pending2FA = authService.getPending2FA();

    if (!pending2FA?.mfaChallengeId) {
      setLoginError("Phiên xác thực 2FA không hợp lệ. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      await verify2FA({
        mfaChallengeId: pending2FA.mfaChallengeId,
        inputCode: twoFACode,
      });

      setTwoFACode("");
      setScreen("dashboard");
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Xác thực 2FA thất bại");
    }
  };

  // ── Login Screen ──────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    if (requires2FA) {
      return (
        <TwoFAForm
          twoFACode={twoFACode}
          setTwoFACode={setTwoFACode}
          isLoading={isLoading}
          error={error}
          loginError={loginError}
          onSubmit={handle2FAVerify}
          onBack={() => {
            authService.clearPending2FA();
            setTwoFACode("");
            setLoginError(null);
          }}
        />
      );
    }

    return (
      <LoginForm
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        isLoading={isLoading}
        error={error}
        loginError={loginError}
        onSubmit={handleLogin}
      />
    );
  }

  const handleLogout = async () => {
    await logout();
    setScreen("login");
  };

  const goToBookingAvailability = () => {
    setSelectedBookingId(null);
    setBookingPreselect(null);
    setScreen("booking-availability");
  };

  const goToBookingFormForEdit = (bookingId: string | null) => {
    setSelectedBookingId(bookingId);
    setBookingPreselect(null);
    setScreen("booking-form");
  };

  const goToBookingFormFromAvailability = (preselect: BookingPreselect | null) => {
    setSelectedBookingId(null);
    setBookingPreselect(preselect);
    setScreen("booking-form");
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar screen={screen} setScreen={setScreen} userRole={userRole} />
      <Header
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        userRole={userRole}
        setIsLoggedIn={handleLogout}
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
          {screen === "booking" && (
            <BookingScreen
              setScreen={(nextScreen) => {
                if (nextScreen === "booking-availability") {
                  goToBookingAvailability();
                  return;
                }

                setScreen(nextScreen);
              }}
              setSelectedBookingId={(id) => {
                if (id) {
                  goToBookingFormForEdit(id);
                  return;
                }

                setSelectedBookingId(null);
              }}
            />
          )}

          {screen === "booking-availability" && (
            <CheckHallAvailabilityScreen
              setScreen={setScreen}
              setBookingPreselect={goToBookingFormFromAvailability}
            />
          )}

          {screen === "booking-form" && (
            <BookingFormScreen
              setScreen={(nextScreen) => {
                if (nextScreen === "booking") {
                  setSelectedBookingId(null);
                  setBookingPreselect(null);
                }

                setScreen(nextScreen);
              }}
              bookingPreselect={bookingPreselect}
              selectedBookingId={selectedBookingId}
              setSelectedBookingId={setSelectedBookingId}
            />
          )}
          {/* Finance screens */}
          {screen === "payment" && <PaymentScreen />}
          {screen === "invoice" && <InvoiceScreen />}
          {screen === "beverage-type-list" && <BeverageTypeListScreen />}

          {screen === "beverage-list" && <BeverageListScreen />}
          {/* Dish / Menu screens */}

          {screen === "dish-type-list" && <DishTypeListScreen />}

          {screen === "dish-list" && <DishListScreen />}
          {screen === "dish-combo-list" && <DishComboListScreen />}

          {/* Package screens */}
          {screen === "package-list" && (
            <PackageListScreen
              setScreen={setScreen}
              selectedPackage={selectedPackage}
              setSelectedPackage={setSelectedPackage}
            />
          )}

          {screen === "package-form" && (
            <PackageFormScreen
              setScreen={setScreen}
              selectedPackage={selectedPackage}
              setSelectedPackage={setSelectedPackage}
            />
          )}

          {/* Misc screens */}
          {screen === "staff" && <StaffScreen />}
          {screen === "roles" && <RolesScreen />}
          {screen === "reports" && <ReportsScreen />}
          {screen === "audit" && <AuditScreen />}
          {screen === "settings" && <SettingsScreen />}
        </div>
      </main>
    </div>
  );
}