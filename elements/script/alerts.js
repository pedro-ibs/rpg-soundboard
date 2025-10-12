function showSuccessAlert( msg, timeout=3000 ) {
	const toast = document.createElement('div');
	toast.className = 'alert alert-success position-fixed top-0 end-0 m-3';
	toast.style.zIndex = '1060';
	toast.innerHTML = `<i class="bi bi-check-circle"></i> ` + msg;

	document.body.appendChild(toast);

	setTimeout(() => { toast.remove(); }, timeout);
}

function showErrorAlert( msg, timeout=3000 ) {
	const toast = document.createElement('div');
	toast.className = 'alert alert-danger position-fixed top-0 end-0 m-3';
	toast.style.zIndex = '1060';
	toast.innerHTML = `<i class="bi bi-bug-fill"></i> ` + msg;

	document.body.appendChild(toast);

	setTimeout(() => { toast.remove(); }, timeout);
}


function showWarningAlert( msg, timeout=3000 ) {
	const toast = document.createElement('div');
	toast.className = 'alert alert-warning position-fixed top-0 end-0 m-3';
	toast.style.zIndex = '1060';
	toast.innerHTML = `<i class="bi bi-exclamation-circle-fill"></i> ` + msg;

	document.body.appendChild(toast);

	setTimeout(() => { toast.remove(); }, timeout);
}