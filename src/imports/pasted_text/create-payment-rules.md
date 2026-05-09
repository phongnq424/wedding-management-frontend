Name	Create payment
Description	Description Allows the Accountant to create a payment record for an existing booking.
Actor	Accountant
Trigger	The Accountant selects a booking and clicks the "Create Payment" button.
Pre-condition	The Accountant is logged in with administrative permissions.
The booking record exists in the system.
The booking has not been deleted.
Post-condition	A new payment record is created with status "Unprocessed".
An audit log is recorded.

Sequence Flow
 

Activities Flow
 
Business Rules
Activity	BR Code	Description
(2)	BR-CPM-1	Display Booking Form Rules
The system calls InitializePaymentForm(bookingId) to render the payment input interface. 
The following booking information must be displayed as read-only:
-	bookingId
-	customerName
-	customerPhone
-	bookingAmount
-	depositAmount
-	confirmedPaidAmount
-	pendingPaymentAmount
-	remainingAmount
The following fields must be displayed and filled by the Accountant:
-	paymentType: Dropdown (DEPOSIT / PARTIAL_PAYMENT / FINAL_PAYMENT)
Rules:
	+ DEPOSIT is selectable only if no previous 	DEPOSIT payment with status = PROCESSED 	exists for this booking.
	+ FINAL_PAYMENT is selectable only if 	remainingAmount > 0.
-	amount: Numeric input
The following fields are system-controlled:
-	status: Default = UNPROCESSED.
(4),(5.1)	BR-CPM-2	Payment Amount Validation Rules:
When the user clicks "Save", the system executes ValidatePaymentInput(paymentType, amount) with the following rules:
-	Mandatory: amount must be filled. If invalid, show MSG2.
-	If paymentType = DEPOSIT: amount must be greater than or equal to the depositAmount set on the booking. If amount < depositAmount, show MSG 38.
-	If paymentType = FINAL_PAYMENT: amount must equal remainingAmount exactly. If amount ≠ remainingAmount, show MSG 39.
-	If paymentType = PARTIAL_PAYMENT: amount must be less than remainingAmount. If amount ≥ remainingAmount, show MSG 19 (suggest using FINAL_PAYMENT instead).
(5.1)	BR-CPM-3	Duplicate Payment Prevention Rules:
Before saving, the system executes CheckDuplicatePayment(bookingId, paymentType, amount):
If an UNPROCESSED payment of the same paymentType already exists for this booking, the system must display MSG 68 and block saving
(6.1)	BR-CPM-4	Save rules:
If all validations pass, the system executes: CreatePayment(bookingId, paymentType, amount, status, createdBy, createdAt)
Rules:
-	status = UNPROCESSED
-	createdBy = currentUserId
-	createdAt = currentTimestamp
-	deleted = False by default
(7)	BR-CPM-5	Audit Logging Rules:
The system MUST call SaveAuditLog(userId, action, targetId, targetName, timestamp)
-	userId = currentUserId 
-	action = "CREATE_PAYMENT"
-	targetId = paymentId
-	targetName = customerName
-	timestamp = currentTimeStamp
(7)	BR-CPM-6	Message Rules:
-	Upon successful database commit, the system display MSG 48, redirects the user back to the Payment List.
-	If failure (e.g., database error, connection issue), the system display MSG 50.

UC41: Update Payment
Name	Update Payment
Description	Allows the Accountant to update an existing UNPROCESSED payment record before it is processed, without affecting booking financial state.
Actor	Accountant
Trigger	The Accountant selects a specific payment from Payment Management and clicks the "Update" button.
Pre-condition	The Accountant is logged in with appropriate permissions.
The payment record exists in the system. 
The booking related to the payment exists and has not been deleted. 
The payment status = UNPROCESSED.
Post-condition	The payment information is updated. 
The payment remains in UNPROCESSED status. 
The booking financial data (confirmedPaidAmount, remainingAmount, status) remains unchanged. 
An audit log is recorded.

Sequence Flow
 
Activities Flow
 
Business Rules
Activity	BR Code	Description
(2)	BR-UPM-1	Data Retrieval Rules:
The system calls FetchPaymentData(paymentId) and InitializePaymentForm(bookingId) to populate the update payment form. The returned data must be mapped to the form fields.
The following booking information must be displayed as read-only:
-	bookingId
-	customerName
-	customerPhone
-	bookingAmount
-	depositAmount
-	confirmedPaidAmount
-	pendingPaymentAmount
-	remainingAmount
The following fields must be displayed and loaded from the existing payment record:
-	paymentType: Dropdown (DEPOSIT / PARTIAL_PAYMENT / FINAL_PAYMENT)
-	amount: Numeric input
The following fields are system-controlled:
-	status: Current payment status, read-only.
-	lastModifiedAt: System field (read-only, used for concurrency control)
The payment can be updated only if status = UNPROCESSED.
If payment status is PROCESSED, REJECTED, CANCELLED or FAILED, the system blocks update and hides the “Update” button.
(4)	BR-UPM-2	Payment Amount Validation Rules:
When the user clicks "Save", the system executes ValidatePaymentInput(paymentType, amount) with the following rules:
-	Mandatory: amount, paymentType must be filled. If invalid, show MSG2.
-	If paymentType = DEPOSIT: amount must be greater than or equal to the depositAmount set on the booking. If amount < depositAmount, show MSG 38.
-	If paymentType = FINAL_PAYMENT: amount must equal remainingAmount exactly. If amount ≠ remainingAmount, show MSG 39.
-	If paymentType = PARTIAL_PAYMENT: amount must be less than remainingAmount. If amount ≥ remainingAmount, show MSG 19 (suggest using FINAL_PAYMENT instead).
(5.1)	BR-UPM-3	Status Rules:
The system executes CheckPaymentStatus(paymentId):
-	If payment status is PROCESSED, REJECTED, CANCELLED or FAILED, block Update and show MSG 28.
(5.1)	BR-UPM-4	Duplicate Payment Prevention Rules:
Before saving, the system executes CheckDuplicatePayment(bookingId, paymentType, amount):
If an UNPROCESSED payment of the same paymentType already exists for this booking, the system must display MSG 68 and block saving
(5.1)	BR-UPM-5	Concurrency Rules:
The system should implement optimistic locking to prevent overwriting changes if two managers edit the same record simultaneously. The system execute: CheckVersionConflict(typeId, userLastModifiedAt) then block Update if userLastModifiedAt != Payment.lastModifiedAt then block Update and Show MSG 62.
(6.1)	BR-UPM-6	Saving Rules:
If all validations pass, the system executes UpdatePayment(paymentId, paymentType, amount, lastModifiedBy, lastModifiedAt)
Rule:
-	lastModifiedBy = currentUserId
-	lastModifiedAt = currentTimestamp
-	The system must not update bookingAmount, confirmedPaidAmount, pendingPaymentAmount, remainingAmount or booking status.
(7)	BR-UPM-7	Audit Logging Rules:
The system MUST call SaveAuditLog(userId, action, targetId, targetName, timestamp)
-	userId = currentUserId 
-	action = "UPDATE_PAYMENT"
-	targetId = paymentId
-	targetName = customerName
-	timestamp = currentTimeStamp
(7)	BR-UPM-8	Display Result Rules:
On Failure: (e.g., database error, connection issue), display MSG 16.
On Success: Display MSG 17.

UC42: Cancel Payment
Name	Cancel payment
Description	Allows the Accountant to cancel an existing unprocessed payment record while preserving payment history.
Actor	Accountant
Trigger	The Accountant selects a specific payment from “Payment Management” and clicks the "Cancel" button.
Pre-condition	The Accountant is logged in.
The payment record exists in the system.
The related booking record exists in the system.
The payment status allows cancellation.
Post-condition	The payment status is updated to "CANCELLED".
The payment record is preserved for historical tracking.
The pending payment amount of the booking is recalculated.
An audit log is recorded.

Sequence Flow
 
Activities Flow
 
Business Rules
Activity	BR Code	Description
(2)	BR-CAP-1	Confirmation Rules:
The system shows ShowConfirmDialog(MSG 1) before executing the deletion.
The confirmation dialog must display booking summary information: bookingId, customerName, customerPhone, paymentType, amount, status
(3)	BR-CAP-2	User choice:
If the user selects "No", the system closes the prompt and returns the user to the previous screen.
If the user selects "Yes", the system proceeds to cancellation validation.
(4)	BR-CAP-3	Validation Reason:
If reason is empty, show MSG2.
(5.1)	BR-CAP-4	Cancellation Permission Rules:
The system must check payment status before allowing cancellation.
The payment can be cancelled only if status = UNPROCESSED.
If payment status is PROCESSED, REJECTED, CANCELLED or FAILED, the system blocks cancellation and displays MSG 67.
(6.1)	BR-CAP-5	Deletion Rules:
If all checks pass, the system executes CancelPayment(paymentId, reason, cancelledBy, cancelledAt):
-	status = CANCELLED
-	reason = reason entered by user
-	cancelledBy = currentUserId
-	cancelledAt = currentTimestamp
The payment must not be hidden from Payment Management unless the user filters it out.
(7)	BR-CAB-6	Booking Payment Summary Recalculation Rules:
After payment cancellation, the system executes GetPaymentByBooking(bookingId) to recalculate:
-	pendingPaymentAmount = sum of all UNPROCESSED payment amounts.
-	confirmedPaidAmount = sum of all PROCESSED payment amounts.
-	remainingAmount = bookingAmount - confirmedPaidAmount.
(7)	BR-CAB-7	Audit Logging:
The system MUST call SaveAuditLog(userId, action, targetId, targetName, timestamp)
-	userId = currentUserId 
-	action = "CANCEL_PAYMENT"
-	targetId = paymentId
-	targetName = customerName
-	timestamp = currentTimeStamp
(8)	BR-CAB-8	Display Result Rules:
On Success, display MSG 20, refresh Payment List, remove deleted item from UI.
On failure (e.g., database error, connection issue): display MSG 21

 
UC43: Process Payment
Name	Process Payment
Description	Allows the Accountant to confirm and process an existing UNPROCESSED payment record, update the booking's financial status, and trigger booking status transitions where applicable
Actor	Accountant
Trigger	The Accountant selects an UNPROCESSED payment from the Payment List and clicks the "Process" button.
Pre-condition	The Accountant is successfully logged in.
The payment record exists in the system with status = UNPROCESSED.
The related booking exists and has not been deleted.
The related booking status is PENDING or CONFIRMED.
Post-condition	The payment status is updated to PROCESSED.
The booking's totalPaidAmount and remainingAmount are recalculated.
The booking status is updated if applicable.
A payment receipt document is generated.
An audit log is recorded.

Sequence Flow
 
Activities Flow
 
Business Rules
Activity	BR Code	Description
(2)	BR-PPM-1	Display Processing Form Rules:
The system calls InitializeProcessPaymentForm(paymentId) to render the processing interface.
The system executes GetPaymentById(paymentId) and GetBookingById(bookingId) to retrieve payment and booking information.
The following information must be displayed as read-only:
-	bookingId 
-	customerName 
-	customerPhone 
-	bookingAmount 
-	depositAmount 
-	confirmedPaidAmount 
-	pendingPaymentAmount 
-	remainingAmount 
-	paymentType 
-	amount
The following fields must be displayed and filled by the Accountant:
-	paymentMethod: Dropdown (Cash / Bank Transfer / Card)
-	paymentDate: Date picker (default = today, cannot be a future date)
-	referenceNumber: Text input (optional, used for bank transfer or card reference)
-	receivedAmount: Numeric input.
-	note: Text area (optional).
The following fields are system-controlled:
-	changeAmount 
-	processedBy 
-	processedAt
Rules:
-	The payment can be displayed for processing only if status = UNPROCESSED.
-	If status = PROCESSED, REJECTED, CANCELLED or FAILED, the system blocks processing and displays corresponding message.
-	The related booking must not be deleted. 
(4)	BR-PPM-2	Validation Rules:
When the user clicks "Process", the system executes ValidateProcessPaymentInput(paymentMethod, paymentDate, receivedAmount, referenceNumber):
-	Mandatory: paymentMethod, paymentDate, receivedAmount must be filled. If invalid, show MSG2.
-	paymentDate must not be a future date. If invalid, show MSG 37.
If paymentMethod = Cash:
-	receivedAmount must be greater than or equal to amount. If invalid, show MSG 69.
If paymentMethod = Bank Transfer or Card:
-	receivedAmount is set equal to amount by system.
-	referenceNumber must be filled. If invalid, show MSG2.
The system calculates changeAmount = receivedAmount - amount.
(5.1)	BR-PPM-3	Check Payment:
Payment state validation rules:
-	The system executes GetPaymentById(paymentId) again before processing. 
-	Payment must exist. 
-	payment.deleted must be False. 
-	payment.status must be UNPROCESSED. 
-	If payment.status is PROCESSED, REJECTED, CANCELLED or FAILED, the system blocks processing and displays corresponding message. 
Booking state validation rules:
-	The system executes GetBookingById(payment.bookingId) again before processing. 
-	Booking must exist. 
-	booking.deleted must be False. 
-	booking.status must be PENDING or CONFIRMED. 
-	If booking.status is ONGOING, COMPLETED, CANCELLED or DELETED, the system blocks processing and displays corresponding message. 
Payment amount consistency rules:
-	The system executes GetPaymentSummary(bookingId) before processing. 
-	confirmedPaidAmount + payment.amount must not exceed booking.bookingAmount. 
-	If payment.paymentType = DEPOSIT, the system executes GetProcessedPayments(bookingId). 
-	If a PROCESSED DEPOSIT already exists, the system blocks processing. 
-	Process Payment must not change payment.amount.
(5.1)	BR-PPM-4	Display 2FA Prompt Rules:
If all validations pass, the system executes Show2FAPrompt(paymentId, currentUserId).
The 2FA prompt must display:
-	customerName 
-	paymentType 
-	amount 
-	paymentMethod 
-	paymentDate
The following field must be displayed and filled by the Accountant:
-	inputCode: Text input
̣(7)	BR-PPM-5	2FA Verification Rules:
The system executes:
Verify2FACode(currentUserId, inputCode):
-	inputCode must be filled. If invalid, show MSG2 and stop process.
-	If inputCode is valid, the system call MSG 57 and proceeds to Step 8.1.
-	If inputCode is invalid or expired, the system call MSG 56 and proceeds to Step 8.2.
(8.1)	BR-PPM-6	Processing Rules:
The system executes the following in a database transaction ProcessPayment(paymentId, paymentMethod, paymentDate, receivedAmount, changeAmount, referenceNumber, note, processedBy, processedAt):
-	status = PROCESSED
-	processedBy = currentUserId 
-	processedAt = currentTimestamp 
-	lastModifiedBy = currentUserId 
-	lastModifiedAt = currentTimestamp
Rules:
-	If payment has already been processed by another user, rollback and show MSG 5.
(9)	BR-PPM-7	Associated Invoice Update Rules:
After the payment is processed successfully, the system executes GetInvoiceByBooking(bookingId).
-	If an invoice exists, the system executes UpdateInvoicePaymentStatus(invoiceId, paymentStatus, lastModifiedBy, lastModifiedAt). 
Rules:
-	If invoice does not exist, skip this step. 
-	If payment.paymentType = FINAL_PAYMENT AND remainingAmount = 0, then paymentStatus = PAID. 
-	If confirmedPaidAmount > 0 AND remainingAmount > 0, then paymentStatus = PARTIALLY_PAID. 
-	If confirmedPaidAmount = 0, then paymentStatus = UNPAID. 
-	The invoice must not calculate or store receivedAmount, changeAmount, or referenceNumber. 
-	Payment details (paymentMethod, referenceNumber, receivedAmount, changeAmount) must be stored only in the Payment record. 
-	The invoice update must be executed in the same database transaction as ProcessPayment.
(10)	BR-PPM-8	Audit log rules:
After payment and booking payment summary are updated successfully, the system MUST call:
SaveAuditLog(userId, action, targetId, targetName, timestamp)
-	userId = currentUserId 
-	action = "PROCESS_PAYMENT" 
-	targetId = paymentId 
-	targetName = customerName 
-	timestamp = currentTimeStamp
(11)	BR-PPM-9	Message Rules:
-	Upon successful database commit, the system display MSG 6, redirects the user back to the Payment List.
-	If failure (e.g., database error, connection issue), the system display MSG 5.
UC44: Search Payment
Name	Search Payment
Description	Allow the Accountant to search payment records by booking, customer, or transaction status.
Actor	Accountant
Trigger	The actor navigates to “Payment Management” section or enters search criteria and clicks "Search".
Pre-condition	The actor is successfully logged into the system and has permission to search payment.
Post-condition	A list of payments matching the search criteria is displayed.
If no matches are found, an appropriate message is shown.

Sequence Flow
 
Activities Flow
 
Business Rules
Activity	BR Code	Description
(1)	BR-SBK-1	Initial Load Rules:
By default, when the screen is accessed, the system calls RetrieveAllPayments().
The result must exclude records with deleted = True and sorted by "Last Modified" DESC.
Search Field Rules:
The system provides a search bar that allows searching by:
-	paymentId: Text input 
-	bookingId: Text input 
-	customerName: Text input 
-	customerPhone: Text input 
-	paymentType: Dropdown (DEPOSIT / PARTIAL_PAYMENT / FINAL_PAYMENT / All) 
-	paymentMethod: Dropdown (Cash / Bank Transfer / Card / All) 
-	paymentDateFrom: Date picker 
-	paymentDateTo: Date picker 
-	amountFrom: Numeric input 
-	amountTo: Numeric input 
-	referenceNumber: Text input 
-	status: Filter by UNPROCESSED / PROCESSED / CANCELLED / REJECTED / FAILED / All 
All fields are optional.
Rules:
-	Default status filter = All.
-	UNPROCESSED payments may not have paymentMethod, paymentDate, referenceNumber, receivedAmount or changeAmount yet.
(3)	BR-SBK-2	Search Logic:
The system executes SearchPayment with logic rules:
-	If paymentId is provided, return payments where paymentId matches exactly or partially based on system ID format. 
-	If bookingId is provided, return payments where bookingId matches exactly or partially based on system ID format. 
-	 Partial match and case-insensitive matching for customerName. 
-	Partial matching for customerPhone.  
-	If paymentDateFrom is provided, return payments where paymentDate >= paymentDateFrom. 
-	If paymentDateTo is provided, return payments where paymentDate <= paymentDateTo. 
-	If amountFrom is provided, return payments where amount >= amountFrom. 
-	If amountTo is provided, return payments where amount <= amountTo. 
-	If referenceNumber is provided, return payments where referenceNumber partially matches and case-insensitive. 
-	Filters are combined using AND condition. 
-	The system must exclude records with deleted = True. 
-	The system must include payment records even if paymentMethod, paymentDate or referenceNumber is null, unless the user explicitly filters by those fields.
Performance: Response time must be ≤ 1 second
(4.1)	BR-SBK-3	Display Results Rules:
If results are found, the system renders a table containing:
-	paymentId 
-	bookingId 
-	customerName 
-	customerPhone 
-	paymentType 
-	amount 
-	paymentMethod 
-	paymentDate 
-	receivedAmount 
-	changeAmount 
-	referenceNumber 
-	status 
-	createdAt 
-	processedAt 
-	lastModifiedAt
Status rules: 
-	UNPROCESSED: Grey badge 
-	PROCESSED: Green badge 
-	CANCELLED: Red badge 
-	REJECTED: Orange badge 
-	FAILED: Red badge
Action button rules:
-	If status = UNPROCESSED: show Update, Process and Cancel buttons. 
-	If status = PROCESSED: hide Update, Process and Cancel buttons. 
-	If status = CANCELLED, REJECTED or FAILED: hide Update, Process and Cancel buttons.
Pagination: Applied if > 20 records, maximum 20 records on per page.
(4.2)	BR-SBK-4	Empty Result Rules:
If no payment matches the search criteria, the system must clear the table and display MSG 12

UC45: Create VAT Invoice
Name	Create VAT Invoice
Description	Allow the Accountant to create an invoice draft for an existing booking.
Actor	Accountant
Trigger	The Accountant selects a booking and clicks "Create Invoice".
Pre-condition	The Accountant is logged in with administrative permissions.
The booking exists and booking.deleted = False.
Post-condition	A new invoice record is created with status = DRAFT.
An audit log is recorded.

Sequence Flow
 
Activities Flow
 
Business Rules
Activity	BR Code	Description
(2)	BR-CIV-1	Request Create Invoice Rules:
The system receives request to create invoice for bookingId.
The system executes: CheckExistingInvoiceByBooking(bookingId):
-	If an invoice with status = DRAFT, ISSUED or ADJUSTED already exists for this booking, the system returns 409 and shows MSG 32.
-	If no existing invoice is found, the system proceeds to retrieve booking data.
(3.1)	BR-CIV-2	Query Booking and Payment Rules:
The system executes GetBookingById(bookingId) and GetPaymentByBooking(bookingId).
The following booking information must be retrieved:
•	bookingId 
•	customerName 
•	customerPhone 
•	customerEmail 
•	bookingDate 
•	weddingDate 
•	bookingAmount 
•	taxAmount 
•	confirmedPaidAmount
•	remainingAmount 
•	status 
The following payment information must be retrieved:
•	paymentId 
•	paymentType
•	amount 
•	status 
•	processedAt
(4)	BR-CIV-3	Invoice Creation Condition Rules:
The system executes ValidateInvoiceCreationCondition(bookingId, bookingStatus, paymentStatus, remainingAmount)
Rules:
-	Booking must exist.
-	booking.deleted = False
-	Booking status must be COMPLETED.
Payment condition:
-	The system executes GetPaymentSummary(bookingId).
-	Invoice can be created regardless of remainingAmount.
-	paymentStatus is determined as:
o	If confirmedPaidAmount = 0 → paymentStatus = UNPAID
o	If confirmedPaidAmount > 0 AND remainingAmount > 0 → paymentStatus = PARTIALLY_PAID
o	If remainingAmount = 0 → paymentStatus = PAID
If anything invalid, show MSG 70.
(5)	BR-CIV-4	Draft Invoice Display Rules:
The system executes BuildDraftInvoicePreview(bookingId):
-	The system must build invoice preview from saved booking snapshot data.
-	The system must not recalculate booking price from current package, menu, service, beverage, or tax configuration.
-	The preview must display:
o	seller information
o	buyer information input area
o	booking summary
o	invoice line items
o	subtotalAmount
o	taxAmount
o	totalAmount
o	paymentStatus
o	status = DRAFT
(6)	BR-CIV-5	Buyer Information Input Rules
The Accountant inputs:
-	buyerName 
-	buyerLegalName 
-	buyerTaxCode 
-	buyerAddress 
-	buyerEmail 
-	buyerPhone 
-	buyerBankAccount 
-	buyerBankName
(7)	BR-CIV-5	Buyer Information Validation Rules:
The system executes ValidateBuyerInvoiceInput(buyerName, buyerLegalName, buyerTaxCode, buyerAddress, buyerEmail, buyerPhone):
-	If mandatory fields are empty, show MSG2.
-	If email is invalid, show MSG31.
-	If phone number is invalid, show MSG30.
-	If buyer tax code is provided but invalid, show MSG71.
(8)	BR-CIV-6	Invoice Draft Saving Rules
If validation passes, the system executes CreateInvoiceDraft(
    bookingId,
    buyerName,
    buyerLegalName,
    buyerTaxCode,
    buyerAddress,
    buyerEmail,
    buyerPhone,
    buyerBankAccount,
    buyerBankName,
    subtotalAmount,
    taxAmount,
    totalAmount,
    paymentStatus,
    status,
    createdBy,
    createdAt
)
Rules:
-	status = DRAFT
-	paymentStatus is derived from payment summary.
-	createdBy = currentUserId
-	createdAt = currentTimestamp
-	deleted = False by database default.
(8)	BR-CIV-7	Invoice Snapshot Saving Rules
The system executes: SaveInvoiceLineSnapshot(invoiceId, bookingPricingSnapshot) to:
-	Invoice lines must be copied from saved booking snapshot data.
-	Future changes to booking, package, menu item, service, beverage price, or tax configuration must not affect this invoice.
(9)	BR-CIV-8	Audit Logging Rules
The system MUST call: SaveAuditLog(userId, action, targetId, targetName, timestamp)
-	userId = currentUserId 
-	action = "CREATE_INVOICE" 
-	targetId = invoiceId 
-	targetName = customerName 
-	timestamp = currentTimestamp
(9)	BR-CIV-9	Display Result Rules:
Upon successful database commit, the system display MSG 48, redirects the user back to the Invoice List.
If failure (e.g., database error, connection issue), the system display MSG 50.

UC46: Generate Invoice
Name	Generate Invoice
Description	Allow the Accountant to officially issue a draft VAT invoice through the connected e-invoice provider and generate the final PDF invoice.
Actor	Accountant
Trigger	The Accountant selects a draft invoice and clicks "Generate Invoice" or "Issue Invoice".
Pre-condition	The Accountant is logged in with administrative permissions.
The invoice exists and invoice.deleted = False.
The invoice status = DRAFT.
Post-condition	The invoice is officially issued.
Tax authority code and PDF file are saved.
An audit log is recorded.

Sequence Flow
 
Activities Flow
 
Business Rules
Activity	BR Code	Description
(2)	BR-GVI-1	Invoice Information Checking Rules
The system executes:
-	GetInvoiceById(invoiceId)
-	GetInvoiceLineSnapshot(invoiceId)
Rules:
-	Invoice must exist.
-	invoice.deleted = False.
-	Invoice status must be DRAFT.
-	If anything is invalid, block generation and show MSG 72.
(3)	BR-GVI-2	2FA Verification Form Rules:
The system executes: Show2FAVerificationForm(invoiceId, currentUserId).
The form must display:
-	invoiceId 
-	bookingId 
-	customerName 
-	buyerName 
-	totalAmount 
-	taxAmount 
The Accountant inputs:
-	inputCode: text input
(5)	BR-GVI-3	2FA Verification Rules:
The system executes Verify2FACode(currentUserId, inputCode):
-	inputCode must be filled. If empty, show MSG2.
-	If invalid or expired, show MSG56.
-	If valid, show MSG 57 and continue generating invoice.
(6.1)	BR-GVI-4	Invoice Provider Submission Rules
The system executes SendSignedInvoiceToProvider(invoiceId)
Rules:
-	The system must send saved invoice draft data from database.
-	The system must not send unsaved UI data.
-	Submitted data must include:
o	seller information
o	buyer information
o	invoice line snapshots
o	subtotal amount
o	tax amount
o	total amount
(7.1)	BR-GVI-5	Provider Response Rules
If provider accepts the invoice, the response must include:
-	providerInvoiceId 
-	invoiceNumber 
-	invoiceSymbol 
-	taxAuthorityCode 
-	issuedAt
(7.2)	BR-GVI-5	If provider rejects the invoice:
-	update invoice status = REJECTED 
-	save provider error message 
-	show MSG 40
(7.1)	BR-GVI-6	PDF Rendering Rules:
If provider accepts the invoice, the system executes RenderInvoicePdf(invoiceId, taxAuthorityCode).
The PDF must include:
-	invoice number
-	invoice symbol
-	tax authority code 
-	seller information 
-	buyer information 
-	invoice lines 
-	subtotal amount 
-	tax amount 
-	total amount 
-	issuedAt 
(8)	BR-GVI-7	Invoice Update Rules
After PDF is rendered, the system executes UpdateInvoiceIssuedInfo(
    invoiceId,
    providerInvoiceId,
    invoiceNumber,
    invoiceSymbol,
    taxAuthorityCode,
    pdfUrl,
    status,
    issuedBy,
    issuedAt,
    lastModifiedBy,
    lastModifiedAt
)
Rules:
-	status = ISSUED 
-	issuedBy = currentUserId 
-	issuedAt = currentTimestamp 
-	lastModifiedBy = currentUserId 
-	lastModifiedAt = currentTimestamp
(9)	BR-GVI-7	Audit Logging Rules
The system MUST call: SaveAuditLog(userId, action, targetId, targetName, timestamp)
-	userId = currentUserId 
-	action = "GENERATE_INVOICE" 
-	targetId = invoiceId 
-	targetName = customerName 
-	timestamp = currentTimestamp
(9)	BR-GVI-8	Display Result Rules:
On Failure: (e.g., database error, connection issue), display MSG 16.
On Success: Display MSG 17.

UC47: Search Invoice
Name	Search invoice
Description	Allow the Accountant to search and filter VAT invoice records by booking, customer, buyer information, invoice status, payment status, issued date and invoice number.
Actor	Accountant
Trigger	The Accountant navigates to “Invoice Management” section or enters search criteria and clicks "Search".
Pre-condition	The Accountant is successfully logged into the system and has permission to search invoice.
Post-condition	A list of invoices matching the search criteria is displayed.
If no matches are found, an appropriate message is shown.
Sequence Flow
 
Activities Flow
 
Business Rules
Activity	BR Code	Description
(1)	BR-SIV-1	Initial Load Rules:
By default, when the screen is accessed, the system calls RetrieveAllInvoices(). The result must exclude records with deleted = True and sorted by "Last Modified" DESC.
Search Field Rules:
The system provides a search bar that allows searching by:
-	invoiceId: Text input 
-	bookingId: Text input 
-	customerName: Text input 
-	customerPhone: Text input 
-	buyerName: Text input 
-	buyerLegalName: Text input 
-	buyerTaxCode: Text input 
-	invoiceNumber: Text input 
-	invoiceSymbol: Text input 
-	taxAuthorityCode: Text input 
-	issuedDateFrom: Date picker 
-	issuedDateTo: Date picker 
-	totalAmountFrom: Numeric input 
-	totalAmountTo: Numeric input 
-	paymentStatus: Dropdown (UNPAID / PARTIALLY_PAID / PAID / All) 
-	status: Dropdown (DRAFT / ISSUED / REJECTED / CANCELLED / All) 
Rules:
-	All fields are optional. 
-	Default status filter = All. 
-	Default paymentStatus filter = All. 
-	Draft invoices may not have invoiceNumber, invoiceSymbol, taxAuthorityCode, or issuedAt yet
(3)	BR-SIV-2	Search Logic:
The system executes SearchInvoice(invoiceId, bookingId, customerName, customerPhone, buyerName, buyerLegalName, buyerTaxCode, invoiceNumber, invoiceSymbol, taxAuthorityCode, issuedDateFrom, issuedDateTo, totalAmountFrom, totalAmountTo, paymentStatus, status) with logic rules:
Rules:
-	If invoiceId is provided, return invoices where invoiceId matches exactly or partially based on system ID format. 
-	If bookingId is provided, return invoices where bookingId matches exactly or partially based on system ID format. 
-	Partial match and case-insensitive matching for: 
o	customerName 
o	buyerName 
o	buyerLegalName 
o	invoiceNumber 
o	invoiceSymbol 
o	taxAuthorityCode 
-	Partial matching for: 
o	customerPhone 
o	buyerTaxCode 
-	If issuedDateFrom is provided, return invoices where issuedAt >= issuedDateFrom. 
-	If issuedDateTo is provided, return invoices where issuedAt <= issuedDateTo. 
-	If totalAmountFrom is provided, return invoices where totalAmount >= totalAmountFrom. 
-	If totalAmountTo is provided, return invoices where totalAmount <= totalAmountTo. 
-	If paymentStatus is provided and not All, return invoices with matching paymentStatus. 
-	If status is provided and not All, return invoices with matching status. 
-	Filters are combined using AND condition. 
-	The system must exclude records with deleted = True. 
-	The system must include draft invoices even if invoiceNumber, invoiceSymbol, taxAuthorityCode, or issuedAt is null, unless the user explicitly filters by those fields.
Performance: Response time must be ≤ 1 second
(4.1)	BR-SIV-3	Display Results Rules:
If results are found, the system renders a table containing:
-	invoiceId 
-	bookingId 
-	customerName 
-	customerPhone 
-	buyerName 
-	buyerLegalName 
-	buyerTaxCode 
-	invoiceNumber 
-	invoiceSymbol 
-	taxAuthorityCode 
-	subtotalAmount 
-	taxAmount 
-	totalAmount 
-	paymentStatus 
-	status 
-	createdAt 
-	issuedAt 
-	lastModifiedAt 
Status rules:
-	DRAFT: Grey badge 
-	ISSUED: Green badge 
-	REJECTED: Orange badge 
-	CANCELLED: Red badge 
Payment status rules:
-	UNPAID: Red badge 
-	PARTIALLY_PAID: Orange badge 
-	PAID: Green badge 
Action button rules:
-	If status = DRAFT: show View, Update, Generate, Cancel buttons. 
-	If status = ISSUED: show View, Download PDF buttons. 
-	If status = REJECTED: show View, Update, Generate, Cancel buttons. 
-	If status = CANCELLED: show View only. 
-	If deleted = True: do not display. 
Pagination:
-	Applied if more than 20 records. 
-	Maximum 20 records per page.
(4.2)	BR-SIV-4	Empty Result Rules:
If no invoice matches the search criteria, the system must clear the table and display MSG 12

UC48: Cancel Invoice
Name	Cancel invoice
Description	Allow the Accountant to cancel an existing draft or rejected VAT invoice while preserving invoice history.
Actor	Accountant
Trigger	The Accountant selects a specific invoice from “Invoice Management” and clicks the "Cancel" button.
Pre-condition	The Accountant is logged in.
The invoice record exists in the system.
The invoice status allows cancellation.
Post-condition	The invoice status is updated to CANCELLED.
The invoice record is preserved for historical tracking.
An audit log is recorded.

Sequence Flow
 
Activities Flow
 
Business Rules
Activity	BR Code	Description
(2)	BR-CAI-1	Confirmation Rules:
The system shows ShowConfirmDialog(MSG 1) before executing the deletion.
The confirmation dialog must display invoice summary information: invoiceId, bookingId, customerName, customerPhone, buyerName, buyerTaxCode, totalAmount , paymentStatus, status 
(3)	BR-CAI-2	User choice:
If the user selects "No", the system closes the prompt and returns the user to the previous screen.
If the user selects "Yes", the system proceeds to cancellation validation.
(4)	BR-CAI-3	Validation Reason:
If reason is empty, show MSG2.
(5.1)	BR-CAI-4	Cancellation Permission Rules:
The system executes: CheckInvoiceStatus(invoiceId)
Rules:
-	Invoice must exist. 
-	invoice.deleted = False. 
-	Invoice can be cancelled only if status = DRAFT or status = REJECTED. 
-	If invoice status is ISSUED or CANCELLED, block cancellation and display MSG 67.
-	The system must not physically delete the invoice record.
(6.1)	BR-CAI-5	Deletion Rules:
If all checks pass, the system executes:
CancelInvoice(invoiceId, reason, cancelledBy, cancelledAt):
-	status = CANCELLED 
-	reason = reason entered by user 
-	cancelledBy = currentUserId 
-	cancelledAt = currentTimestamp 
-	lastModifiedBy = currentUserId 
-	lastModifiedAt = currentTimestamp 
The invoice must not be hidden from Invoice Management unless the user filters it out.
(7)	BR-CAI-6	Active Invoice Release Rules
After cancellation, the system allows a new invoice draft to be created for the same booking.
Rules:
-	Cancelled invoice must not block CheckExistingInvoiceByBooking(bookingId).
-	The system must preserve cancelled invoice snapshot data for audit and history.
-	The system must not update booking amount, booking status, payment records, or payment status of other invoices.
(7)	BR-CAI-7	Audit Logging:
The system MUST call SaveAuditLog(userId, action, targetId, targetName, timestamp)
-	userId = currentUserId 
-	action = "CANCEL_INVOICE"
-	targetId = invoiceId
-	targetName = customerName
-	timestamp = currentTimeStamp
(8)	BR-CAI-8	Display Result Rules:
On Success, display MSG 20, refresh Invoice List, remove deleted item from UI.
On failure (e.g., database error, connection issue): display MSG 21

UC49: Update Invoice
Name	Update VAT Invoice
Description	Allow the Accountant to update an existing VAT invoice draft before it is officially issued, without affecting booking financial data or invoice snapshot.
Actor	Accountant
Trigger	The Accountant selects a specific invoice from Invoice Management and clicks the "Update" button.
Pre-condition	The Accountant is logged in with appropriate permissions. 
The invoice record exists in the system. 
The related booking exists and has not been deleted. 
The invoice status allows update.
Post-condition	The invoice information is updated. 
Invoice snapshot and financial data remain unchanged. 
An audit log is recorded.

Sequence Flow
 
Activities Flow
 
Business Rules
Activity	BR Code	Description
(2)	BR-UIV-1	Data Retrieval Rules:
The system calls FetchInvoiceData(invoiceId) and GetInvoiceLineSnapshot(invoiceId) to populate the update payment form. The returned data must be mapped to the form fields.
The following booking information must be displayed as read-only:
-	invoiceId 
-	bookingId 
-	customerName 
-	customerPhone 
-	subtotalAmount 
-	taxAmount 
-	totalAmount 
-	paymentStatus 
-	status 
-	createdAt 
-	issuedAt 
-	lastModifiedAt
Editable fields:
-	buyerName 
-	buyerLegalName 
-	buyerTaxCode 
-	buyerAddress 
-	buyerEmail 
-	buyerPhone 
-	buyerBankAccount 
-	buyerBankName
(4)	BR-UIV-2	Payment Amount Validation Rules:
When the user clicks "Save", the system executes ValidateBuyerInvoiceInput(buyerName, buyerLegalName, buyerTaxCode, buyerAddress, buyerEmail, buyerPhone) with the following rules:
-	Mandatory: buyerName, buyerLegalName, buyerAddress, buyerEmail must be filled.must be filled. If invalid, show MSG2.
-	If email is invalid, show MSG31.
-	If phone number is invalid, show MSG30.
If buyer tax code is provided but invalid, show MSG71.
(5.1)	BR-UIV-3	Update Permission Rules:
The system executes: CheckInvoiceStatus(invoiceId)
Rules:
-	Invoice must exist. 
-	invoice.deleted = False. 
-	Invoice can be updated only if status = DRAFT or status = REJECTED. 
-	If invoice status is ISSUED or CANCELLED, the system blocks update and hides button “Update”.
-	If invalid, block Update and show MSG 28.
(5.1)	BR-UIV-4	Concurrency Rules:
The system should implement optimistic locking to prevent overwriting changes if two managers edit the same record simultaneously. The system execute: CheckVersionConflict(typeId, userLastModifiedAt) then block Update if userLastModifiedAt != Invocie.lastModifiedAt then block Update and Show MSG 62.
(6.1)	BR-UIV-5	Saving Rules:
If all validations pass, the system executes UpdateInvoice(
invoiceId, buyerName, buyerLegalName, buyerTaxCode, buyerAddress, buyerEmail, buyerPhone, buyerBankAccount, buyerBankName, lastModifiedBy, lastModifiedAt)
Rule:
-	lastModifiedBy = currentUserId
-	lastModifiedAt = currentTimestamp
(7)	BR-UIV-6	Audit Logging Rules:
The system MUST call SaveAuditLog(userId, action, targetId, targetName, timestamp)
-	userId = currentUserId 
-	action = "UPDATE_INVOICE"
-	targetId = invoiceId
-	targetName = customerName
-	timestamp = currentTimeStamp
(7)	BR-UIV-7	Display Result Rules:
On Failure: (e.g., database error, connection issue), display MSG 16.
On Success: Display MSG 17.
