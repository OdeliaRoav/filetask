var editor;

const settingContentMainForm = () => {
	contentMainForm = new dhx.Form(null, {
		css: "contentMainForm",
		padding: 0,
		rows: [
			{
				cols: [
					{
						id: "boardId",
						type: "select",
						name: "boardId",
						label: language.label_board,
						labelWidth: "80px",
						labelPosition: "left",
						width: "330px",
						options: categoryList
					}
				]
			},
			{
				id: "subject",
				name: "subject",
				type: "textarea",
				label: language.label_subject,
				labelWidth: "80px",
				labelPosition: "left",
				placeholder: language.placeholder_subject,
				maxlength: 100,

			},
			{
				id: "contentContainer",
				name: "contentContainer",
				type: "container"
			},
			{
				id: "attach",
				name: "attach",
				type: "simpleVault",
				label: language.label_file,
				labelWidth: "80px",
				labelPosition: "left",
				target: "file?tenantId=" + TENANTID,
			},
			{
				css: "contentButton",
				cols: [
					{
						id: "cancelBoard",
						name: "cancelBoard",
						type: "button",
						value: language.button_cancel,
						css: "formButton",
						submit: false
					},
					{
						id: "writeBoard",
						name: "writeBoard",
						type: "button",
						value: language.button_contentSave,
						css: "formButton",
						submit: false
					},
					{
						id: "updateBoard",
						name: "updateBoard",
						type: "button",
						value: language.button_contentUpdate,
						css: "formButton",
						submit: false,
						hidden: true
					},
					{
						id: "deleteBoard",
						name: "deleteBoard",
						type: "button",
						css: "formButton",
						value: language.button_contentDelete,
						submit: false
					}
				]
			},
			{
				name: "creatorId",
				type: "input",
				hidden: true,
				hiddenLabel: true,
			},
			{
				name: "creatorName",
				type: "input",
				hidden: true,
				hiddenLabel: true,
			},
			{
				name: "noticeFlag",
				type: "input",
				hidden: true,
				hiddenLabel: true,
			},
			{
				name: "contentId",
				type: "input",
				hidden: true,
				hiddenLabel: true,
			},
			{
				name: "content",
				type: "input",
				hidden: true,
				hiddenLabel: true,
			}
		]
	});

	let attach = "<div class='dhx_form-group  dhx_form-group--inline'>";
	attach += '<label for="subject" class="dhx_label " style="width: 80px; max-width: 100%;">' + language.label_content + '</label>';
	attach += '<div class="dhx_input__wrapper">';
	attach += '<div id="editor"></div>';
	attach += '</div>';
	attach += '</div>';

	contentMainForm.getItem("contentContainer").attachHTML(attach);
	
	contentMainForm.getItem("subject").events.on("keydown", (event) => {
		if(event.keyCode == 13) {
			console.log(event)
			event.returnValue = false;
		}
	});
		
	contentMainForm.getItem("cancelBoard").events.on("click", (event) => {
		showConfirm(language.confirmTitle_moveBoard, language.confirm_moveBoard, () => {
			contentMainForm.clear("value");
			editor.destruct();
			layout.getCell("boardContentWrap").hide();
			layout.getCell("boardWrap").show();
		});
	});

	contentMainForm.getItem("attach").data.events.on("beforeAdd", (value) => {
		if (value.file.size > TENANT_CONFIG.ADMIN_FILE_SIZE) {
			errorMessage(language.errorMessage_largeFileSize);
			return false;
		}
	});

	contentMainForm.getItem("writeBoard").events.on("click", (event) => {
		layout.getCell("contentForm").progressShow();

		let fileData = contentMainForm.getItem("attach").getValue();
		let fileFlag = false;

		for (var i = 0; i < fileData.length; i++) {
			if (fileData[i].status == "queue") {
				fileFlag = true;
			}
		}

		if (fileFlag) {
			writeFlag = true;
			contentMainForm.getItem("attach").send();
		} else {
			contentMainForm.getItem("attach").clear();
			boardContentWrite();
		}
	});

	contentMainForm.getItem("updateBoard").events.on("click", (event) => {
		layout.getCell("contentForm").progressShow();

		let fileData = contentMainForm.getItem("attach").getValue();
		let fileFlag = false;

		for (var i = 0; i < fileData.length; i++) {
			if (fileData[i].status == "queue") {
				fileFlag = true;
			}
		}

		if (fileFlag) {
			writeFlag = false;
			contentMainForm.getItem("attach").send();
		} else {
			contentMainForm.getItem("attach").clear();
			boardContentModify();
		}
	});

	contentMainForm.getItem("attach").events.on("uploadComplete", (files) => {
		if (writeFlag) {
			// 게시글 추가
			boardContentWrite();
		} else {
			// 게시글 수정
			boardContentModify();
		}
	});

	contentMainForm.getItem("attach")._handlers.remove = (e) => {
		let fileId = e.target.offsetParent.dataset.dhxId;

		if (fileId.startsWith("u")) {
			contentMainForm.getItem("attach").data.remove(fileId);
		} else {
			showConfirm(language.confirmTitle_fileDelete, language.confirm_deleteFile, () => {
				originalFileDelete(fileId);
			});
		}
	}

	// 파일 다운로드
	contentMainForm.getItem("attach")._handlers.download = (e) => {
		let fileId = e.target.offsetParent.dataset.dhxId;

		if (fileId.startsWith("u")) {
			errorMessage(language.failMessage_download);
			return false;
		} else if (fileId == undefined || fileId == null) {
			errorMessage(language.errorMessage_download);
			return false;
		} else {
            fileDownload("file/" + fileId);
		}
	}

	// 게시글 삭제
	contentMainForm.getItem("deleteBoard").events.on("click", () => {
		showConfirm(language.confirmTitle_contentDelete, language.confirm_deleteContent, () => {
			deleteBoardContent();
		});
	});

	contentMainForm.getItem("subject").events.on("keydown", (event) => {
		subjectFlexible();
	});

	layout.getCell("contentForm").attach(contentMainForm);
}

const setWysiwyg = (content) => {
	let formattedContent = content.replace(/\n/g, '<br>');

	editor = new Jodit("#editor", {
		height: 400,
		maxHeight: 400,
		placeholder: language.placeholder_wysiwygContent,
		defaultMode: Jodit.MODE_WYSIWYG,
		toolbarButtonSize: "middle",
		disablePlugins: ['add-new-line'],
		uploader: {
			insertImageAsBase64URI: true
		},
		enter: 'DIV',
		iframe: true,
		toolbarAdaptive: false,
		toolbarSticky: false,
		buttons: [
			'bold',
			'italic',
			'underline',
			'strikethrough',
			'|',
			'ul',
			'ol',
			'|',
			'font',
			'fontsize',
			'brush',
			'paragraph',
			'|',
			'outdent',
			'indent',
			'|',
			'image',
			'table',
			'|',
			'left',
			'center',
			'right',
			'|',
			'undo',
			'redo',
		],
		cleanHTML: {
			fillEmptyParagraph: false
		},
		value: formattedContent
	});
	editor.value = formattedContent;
}

const boardContentWrite = () => {
	let boardId = contentMainForm.getItem("boardId").getValue();
	let subject = contentMainForm.getItem("subject").getValue();
	let contents = editor.value;

	if (boardId == "none" || boardId == null) {
		errorMessage(language.errorMessage_pleaseSelectBoard);
		layout.getCell("contentForm").progressHide();
		return false;
	}

	if (subject == "" || subject == null) {
		errorMessage(language.failMessage_nullSubject);
		layout.getCell("contentForm").progressHide();
		return false;
	}

	if (contents == "" || contents == null) {
		errorMessage(language.failMessage_nullContent);
		layout.getCell("contentForm").progressHide();
		return false;
	}

	contentMainForm.getItem("creatorId").setValue(ADMIN_CREATOR_ID);
	contentMainForm.getItem("creatorName").setValue(ADMIN_CREATOR_NAME);
	contentMainForm.getItem("content").setValue(contents);
	contentMainForm.getItem("noticeFlag").setValue(NOTICE_FLAG);

	$.ajax({
		url: "board/content",
		contentType: "application/json",
		data: JSON.stringify(contentMainForm.getValue()),
		method: "post",
		async: false,
		error: (e) => {
			let status = e.status;
			console.log("게시글 작성 오류 : " + status);
			errorMessage(language.errorMessage_addContent);
		},
		success: (data) => {
			switch (data.status) {
				case 0:
					errorMessage(language.failMessage_addContent);
					break;
				case 1:
					dhx.awaitRedraw().then(() => {
						searchForm.getItem("boardId").setValue(contentMainForm.getItem("boardId").getValue());
						tree.setFocus(contentMainForm.getItem("boardId").getValue());

						message(language.message_successWriteContent);
						contentMainForm.clear("value");
						editor.destruct();
						layout.getCell("boardContentWrap").hide();
						layout.getCell("boardWrap").show();

						loadBoardContents(0);
					});
					break;
			}
		}
	});

	layout.getCell("contentForm").progressHide();
}

const boardContentModify = () => {
	let boardId = contentMainForm.getItem("boardId").getValue();
	let subject = contentMainForm.getItem("subject").getValue();
	let contents = editor.value;

	if (boardId == "none" || boardId == null) {
		errorMessage(language.errorMessage_pleaseSelectBoard);
		layout.getCell("contentForm").progressHide();
		return false;
	}

	if (subject == "" || subject == null) {
		errorMessage(language.failMessage_nullSubject);
		layout.getCell("contentForm").progressHide();
		return false;
	}

	if (contents == "" || contents == null) {
		errorMessage(language.failMessage_nullContent);
		layout.getCell("contentForm").progressHide();
		return false;
	}

	contentMainForm.getItem("content").setValue(contents);
	contentMainForm.getItem("noticeFlag").setValue(NOTICE_FLAG);

	$.ajax({
		url: "board/content",
		contentType: "application/json",
		data: JSON.stringify(contentMainForm.getValue()),
		method: "put",
		async: false,
		error: (e) => {
			let status = e.status;
			console.log("게시글 수정 오류 : " + status);
			errorMessage(language.errorMessage_editContent);
		},
		success: (data) => {
			switch (data.status) {
				case 0:
					errorMessage(language.failMessage_editContent);
					break;
				case 1:
					dhx.awaitRedraw().then(() => {
						searchForm.getItem("boardId").setValue(contentMainForm.getItem("boardId").getValue());
						tree.setFocus(contentMainForm.getItem("boardId").getValue());

						message(language.message_editContent);
						contentMainForm.clear("value");
						layout.getCell("boardContentWrap").hide();
						layout.getCell("boardWrap").show();

						loadBoardContents(0);
					});
					break;
			}
		}
	});
	layout.getCell("contentForm").progressHide();
}

const deleteBoardContent = () => {
	let list = [];
	list.push(contentMainForm.getItem("contentId").getValue());

	let data = {
		"tenantId": TENANTID,
		"boardListString": list.toString()
	};

	$.ajax({
		url: "board/contents",
		method: "put",
		contentType: "application/json",
		data: JSON.stringify(data),
		async: false,
		error: (e) => {
			let status = e.status;
			console.log("게시글 삭제 오류 : " + status);
			errorMessage(language.errorMessage_deleteContent);
		},
		success: (data) => {
			switch (data.status) {
				case 0:
					errorMessage(language.failMessage_deleteContent);
					break;
				case 1:
					contentMainForm.clear("value");
					editor.destruct();
					layout.getCell("boardContentWrap").hide();
					layout.getCell("boardWrap").show();

					loadBoardContents(0);
					
					message(language.message_successSelectedDelete);
					break;
			}

		}
	});
	layout.getCell("contentForm").progressHide();
}

const originalFileDelete = (fileId) => {
	let data = {
		"contentId": contentMainForm.getItem("contentId").getValue()
		, "fileId": fileId
	};

	$.ajax({
		url: "board/file",
		method: "put",
		contentType: 'application/json',
		data: JSON.stringify(data),
		async: false,
		error: (e) => {
			let status = e.status;
			console.log("파일 삭제 오류 : " + status);
			errorMessage(language.errorMessage_deleteFile);
		},
		success: (data) => {
			switch (data.status) {
				case 0:
					errorMessage(language.failMessage_deleteFile);
					break;
				case 1:
					contentMainForm.getItem("attach").data.remove(fileId);
					message(language.message_deleteFile);
					break;
			}
		}
	});
}

const subjectFlexible = () => {
	let textarea = document.querySelector('#subject');
	if (textarea) {
		textarea.style.height = 'auto';
		let height = textarea.scrollHeight; // 높이
		textarea.style.height = `${height + 8}px`;
	}
}