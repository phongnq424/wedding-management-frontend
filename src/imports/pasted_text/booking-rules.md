Display Booking Form Rules
The system calls InitializeCreateBookingForm(hallId, bookingDate, shiftId) to render the booking input interface.
The following fields must be displayed and pre-filled from selected hall availability result:
-	bookingDate: Date picker (pre-filled from selected availability) 
-	shift: Selected shift, read-only.
-	hall: Selected hall, read-only.
-	hallPrice: price based on selected hall, shift and day type, read-only.
The following fields must be displayed and cleared by default:
-	customerName: Text input 
-	customerPhone: Text input 
-	customerEmail: Text input
-	brideName: Text input
-	groomName: Text input
-	weddingDate: Date picker
-	numberOfTables: Numeric input
-	numberOfReserveTables: Numeric input
-	bookingMode: PACKAGE / MANUAL
-	bookingDraftLines: Editable list, initially empty 
-	softDrinkQuantity: Numeric input
-	beerQuantity: Numeric input
-	note: Text area (optional)
If booking Mode = PACKAGE:
-	packageId: Dropdown from active wedding package list
-	selectedMenuComboId: Dropdown, loaded only when package contains menu combo options
If bookingMode = MANUAL:
-	packageId must be hidden or disabled.
-	selectedMenuComboId must be hidden or disabled.
-	The user may manually add dishes, dish combos/menu combos, services, beverages and other allowed items into bookingDraftLines.
The following fields are system-controlled:
-	depositAmount: Calculated by system.
-	totalTableAmount: Calculated by system.
-	totalServiceAmount: Calculated by system.
-	subtotalAmount: Calculated by system from all bookingDraftLines including hall, menu/dish, service, beverage, extra item.
-	taxAmount: Calculated by system from line-item tax amounts from GetTaxRate(itemType, itemId).
-	bookingAmount: Calculated by system after tax.
-	remainingAmount: Calculated by system
-	status: Default = PENDING.
Hall Hold Rules:
After the system renders the booking form, the system executes HoldHallSlot(hallId, bookingDate, shiftId, currentUserId).
-	The hold is created for the selected hall, bookingDate and shiftId
-	The hold status is TEMPORARY.
-	The hold must have expiredAt calculated by system configuration holdDurationMinutes.
-	Only one active hold is allowed for the same hallId, bookingDate and shiftId.
-	If another active hold already exists, the system blocks the booking form and displays MSG 35.
-	If the hold expires before the booking is saved, the system releases the hall slot and requires the user to check hall availability again.
Booking Mode Rules:
The system supports PACKAGE and MANUAL booking mode. If the user selects a package, bookingMode = PACKAGE. If no package is selected and manual booking is allowed, bookingMode = MANUAL. If allowManualBooking = False, package selection is mandatory. If no package is available and manual booking is disabled, show MSG 75.
Package Selection Rules: If bookingMode = PACKAGE, the system executes RetrieveAvailableWeddingPackages(hallId, bookingDate, shiftId, numberOfTables, weddingDate). 
Only packages where deleted = False and status = ACTIVE are displayed. Package conditions such as table range, valid date, valid shift, hall type, and minimum booking amount must be checked before the package is selectable.
Package Loading Rules:
When the user selects packageId, the system executes LoadPackageDetail(packageId).
The system displays package information including package name, description, package type, package conditions, allowed menu combo options, included services, optional services, beverage policy, benefits, and customization rules.
-	If the selected package contains menu combo options, the system displays selectedMenuComboId dropdown. 
-	If the package has only one fixed menu combo, the system auto-selects that menu combo. If the package does not contain menu combo options, selectedMenuComboId must be hidden or disabled.
Initial Draft Rules: 
The system executes InitializeBookingDraft(bookingMode, packageId, selectedMenuComboId).
If package mode is used, package data is expanded into booking draft lines. If manual mode is used, the system initializes an empty draft and allows the extension use cases to add dish, beverage, and service lines.
Extension Rules: 
Dish, beverage, and service changes must be handled through the corresponding extension use cases. Create Booking must not directly contain detailed add/remove/replace rules for each item group.
Booking Draft Line Rules:
All chargeable, included, discounted, and promotional items must be represented as booking draft lines before saving. Package name and combo name must not be saved as the main pricing line. They may be stored as source references only.
Pricing Rules:
The system executes RecalculateBookingAmount(bookingDraftLines).
Pricing must be based on booking draft lines. Tax must be calculated per line using GetTaxRate(itemType, itemId). The system calculates subtotalAmount, taxAmount, bookingAmount, depositAmount, and remainingAmount.
Validation Rules:
When the user clicks "Save", the system executes ValidateWeddingInput(customerName, customerPhone, customerEmail, brideName, groomName, weddingDate, packageId, bookingDraftItems, depositAmount) and ValidateTableInput(numberOfTables, numberOfReserveTables, minTables, maxTables).
-	Mandatory: customerName, customerPhone, brideName, groomName, weddingDate, packageId, bookingDraftItems and depositAmount must be filled. If invalid, show MSG2.
-	If email is invalid, show MSG 31
-	If phone number is invalid, show MSG 30
-	numberOfTables must be greater than or equal to minTables. If invalid, show MSG 59.
-	numberOfTables must be less than or equal to maxTables. If invalid, show MSG 66.
-	numberOfReserveTables must be greater than or equal to 0. If invalid, show MSG 24.
-	(numberOfTables + numberOfReserveTables) must be less than or equal to maxTables. If invalid, show MSG 59.
Hall Availability Recheck Rules:
Before saving the booking, the system executes CheckHallAvailability(hallId, bookingDate, shiftId) and ValidateHallHold(hallId, bookingDate, shiftId, currentUserId), if conflict, show MSG 35. 
Saving rules:
If all validations pass, the system executes:
-	CreateBooking(bookingDate, shiftId, hallId, customerName, customerPhone, customerEmail, brideName, groomName, weddingDate, numberOfTables, numberOfReserveTables, bookingMode, packageId, selectedMenuComboId, hallPrice, subtotalAmount, taxAmount, bookingAmount, depositAmount, remainingAmount, note, status, createdBy, createdAt)
-	SaveBookingPackageSnapshot (bookingId, packageId, packageName, packageType, packageDescription, packagePolicySnapshot, selectedMenuComboId, selectedMenuComboName, createdAt)
-	SaveBookingLineSnapshot(bookingId, bookingDraftLines)
Rule:
-	createdBy = currentUserId
-	createdAt = currentTimestamp
-	deleted = False by default
-	Future changes to package, menu item, service or beverage price must not affect this booking.
Confirmation Document Rules:
After successful booking creation, the system executes:
GenerateConfirmationDocument(bookingId), the document must have:
-	customer information
-	bride and groom names
-	bookingDate, shift, hall
-	numberOfTables, numberOfReserveTables
-	full list of booking items
-	total bookingAmount and deposit
If success, show MSG 44.
