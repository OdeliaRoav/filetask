var layout;
var tree;
var searchForm;
var leftWriteButton;
var categoryAddButton;
var grid;
var pagination;
var contentMainForm;
var writeFlag;
var categoryList;

const initBoardManage = () => {
	
	createLayout();	// 레이아웃 구성
	
	settingSearchForm();	// 그리드 상단 검색 폼 그려줌
	
	settingLeftButton();	// 게시판 목록 위, 아래에 각각 글쓰기와 카테고리 추가 버튼 그려줌
	
	settingGrid();	// 게시판 그리드 그려줌
	
	settingTreeForm();	// 게시판 목록 폼 그려줌
	
	settingContentMainForm();	// 게시글 폼 그려줌

	top.layout.getCell("contents").progressHide();
}

const createLayout = () => {
	layout = new dhx.Layout("layout", {
	    type: "space",
	    css: "contentsTitleWrap",
	    header: top.menuTitle,
	    cols: [
	        {
	            id: "main-content",
				header: BUSINESS_NAME,
	            rows: [
					{
						cols:[
							{
								id: "treeWrap",
								width: 380,
								padding: 20,
								rows: [
									{
										id: "writePostAtLeft",
										height: "content"
									},
									{
										id: "treeForm",
										css: "treeForm"
									},
									{
										id: "addBoardCategory",
										height: "content"
									},
								]
							},
							{
								id: "boardWrap",
								gravity: 1,
								rows: [
									{
										id: "searchForm",
										height: 50,
									},
									{
										id: "boardForm",
									},
									{
										id:	"pagination",
									}
								]
							},
							{
								id: "boardContentWrap",
								gravity: 1,
								hidden: true,
								rows: [
									{
										id: "contentForm",
										header: language.layoutHeader_contentHeader
									}
								]
							}
						]
					},
				]
	        },
	    ]
	});
}

const settingSearchForm = () => {
	searchForm = new dhx.Form(null, {
	    css: "dhx_widget--bordered",
	    padding: 0,
	    rows: [
		    {
				cols: [
			        {
						id: "searchCondition",
			            name: "searchCondition",
			            type: "select",
			            value: "all",
			            width: 100,
			            hiddenLabel: true,
			            css: "marginRightFive",
			            options:[
							{
								value: "all",
								content: language.selectOption_all,
							},
							{
								value: "title",
								content: language.selectOption_subject
							},
							{
								value: "writer",
								content: language.selectOption_creatorName
							},
							{
								value: "mix",
								content: language.selectOption_mix
							},
						]
			        },
			        {
			            name: "limit",
			            type: "input",
			            hidden: true,
			            hiddenLabel: true,
			        },
			        {
			            name: "from",
			            type: "input",
			            hidden: true,
			            value: 15,
			            hiddenLabel: true,
			        },
			        {
			            name: "boardId",
			            type: "input",
			            hidden: true,
			            hiddenLabel: true,
			        },
			        {
			            name: "tenantId",
			            type: "input",
			            hidden: true,
			            hiddenLabel: true,
			        },
			        {
						id: "searchWord",
			            name: "searchWord",
			            type: "input",
			            hiddenLabel: true,
			            css: "marginRightFive",
			            placeholder: language.placeholder_searchWord,
			        },
			        {
						id: "searchBoardContent",
			            name: "searchBoardContent",
			            type: "button",
			            value: language.button_search,
			            submit: false
			        },
			        {
						type: "spacer"
					},
					{
						id: "writeContent",
			            name: "writeContent",
			            type: "button",
			            css: "formButton",
			            value: language.button_write,
			            submit: false
			        },
			        {
						id: "deleteBoard",
			            name: "deleteBoard",
			            type: "button",
			            css: "formButton",
			            value: language.button_delete,
			            submit: false
			        }
			    ]
			}
		]
	});
	
	searchForm.getItem("searchBoardContent").events.on("click", (event) => {
		pagination.setPage(0);
		loadBoardContents(0);
	});
	
	searchForm.getItem("searchWord").events.on("keydown", (event, value) => {
		if(event.keyCode == 13) {
			searchForm.getItem("searchWord").setValue($("#searchWord").val());
			pagination.setPage(0);
			loadBoardContents(0);
		}
	});
	
	searchForm.getItem("writeContent").events.on("click", (event) => {
		let boardId = searchForm.getItem("boardId").getValue();
		contentMainForm.clear("value");
		layout.getCell("boardWrap").hide();
		layout.getCell("boardContentWrap").show();
		contentMainForm.getItem("boardId").setValue(boardId);
			
		contentMainForm.getItem("writeBoard").show();
		contentMainForm.getItem("updateBoard").hide();
		contentMainForm.getItem("deleteBoard").hide();

		dhx.awaitRedraw().then(() => {
			setWysiwyg("");
		});
	});
	
	searchForm.getItem("deleteBoard").events.on("click", (event) => {
		const rowsSelected = grid.data.findAll({by:"checkBox", match: true});
		
	    if (rowsSelected.length > 0) {
			showConfirm(language.confirmTitle_contentDelete, language.confirm_deleteSelectContent, () => {
				layout.getCell("boardForm").progressShow();
				let boardList = [];
				
		        rowsSelected.forEach((item) => {
					boardList.push(item.contentId);
				});
				
				deleteBoardSelectContents(boardList);
	        });
	    }else {
	        errorMessage(language.failMessage_notSelectContent);
	    }
	});
	
	layout.getCell("searchForm").attach(searchForm);
}

const settingLeftButton = () => {
	leftWriteButton = new dhx.Form(null, {
	    css: "dhx_widget--bordered",
	    padding: 0,
	    rows: [
		    {
				id: "leftWriteBoard",
	            name: "leftWriteBoard",
	            type: "button",
	            value: language.button_write,
	            css: "treeButton",
	            submit: false

			}
		]
	});
	
	leftWriteButton.getItem("leftWriteBoard").events.on("click", (event) => {
		if(layout.getCell("boardContentWrap").isVisible()) {
			showConfirm(language.confirmTitle_writeContent, language.confirm_writingContent, () => {
				contentMainForm.clear("value");
				editor.destruct();
				dhx.awaitRedraw().then(() => {
					setWysiwyg("");
				});
	        });
		}else{
			layout.getCell("boardWrap").hide();
			layout.getCell("boardContentWrap").show();
			contentMainForm.clear("value");
			dhx.awaitRedraw().then(() => {
				setWysiwyg("");
			});
		}
		
		contentMainForm.getItem("writeBoard").show();
		contentMainForm.getItem("updateBoard").hide();
		contentMainForm.getItem("deleteBoard").hide();
	});

	layout.getCell("writePostAtLeft").attach(leftWriteButton);
	
	categoryAddButton = new dhx.Form(null, {
	    css: "dhx_widget--bordered",
	    padding: 0,
	    rows: [
		    {
				id: "categoryAddButton",
	            name: "categoryAddButton",
	            type: "button",
	            value: language.button_createBoard,
	            css: "treeButton",
	            submit: false
			},
			{
	            name: "tenantId",
	            type: "input",
	            hidden: true,
	            hiddenLabel: true,
	        },
			{
	            name: "boardId",
	            type: "input",
	            hidden: true,
	            hiddenLabel: true,
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
	            name: "name",
	            type: "input",
	            hidden: true,
	            hiddenLabel: true,
	        },
		]
	});
	
	categoryAddButton.getItem("categoryAddButton").events.on("click", (event) => {
		if($("#addCategoryName").length > 0){
			$("#addCategoryName").focus();
			errorMessage(language.failMessage_writing);
			return false;
		}
		
		let categoryInputForm = "";
		categoryInputForm +=	"<li class='dhx_list-item newCategory' tabindex='-1' style='height: 35px;'>";
		categoryInputForm += 		"<div class='furence-tree-template-wrap'>";
		categoryInputForm +=			"<span class='furence-tree-template-value'>";
		categoryInputForm +=				"<input id='addCategoryName' type='text' maxlength='12'>";
		categoryInputForm +=			"</span>";
		categoryInputForm +=			"<div class='furence-tree-template-button-wrap'>";
		categoryInputForm +=				"<div class='furence-template-button newCancel'>";
		categoryInputForm +=					"<img src='image/icon/close.svg'>";
		categoryInputForm +=				"</div>";
		categoryInputForm +=				"<div class='furence-template-button newAdd'>";
		categoryInputForm +=					"<img src='image/icon/save.svg'>";
		categoryInputForm +=				"</div>";
		categoryInputForm +=			"</div>";
		categoryInputForm +=		"</div>";
		categoryInputForm +=	"</li>";
		
		$(".dhx_list").append(categoryInputForm);
		
		$("#addCategoryName").focus();
		
		$("#addCategoryName").on("keydown", (e) => {
			if(e.originalEvent.keyCode == 13) {
				categoryNameEnter();
			}
		});
	});

	layout.getCell("addBoardCategory").attach(categoryAddButton);
}

const settingGrid = () => {
	const config = {
	    columns: [
	        { id: "checkBox", header: [{ text: "<input type='checkbox' id='masterCheckbox' onclick='master_ch(checked)' style='zoom: 1.4;'></input>", align: "center"}], type: "boolean", editable:true, maxWidth: 70 },
	        { id: "subject", header: [{ text: language.gridHeader_subject, align: "center" }], align: "left" },
	        { id: "creatorName", header: [{ text: language.gridHeader_creatorName, align: "center" }], maxWidth: 200},
	        { id: "createDateTime", header: [{ text: language.gridHeader_date, align: "center" }], maxWidth: 200, align: "right" },
	    ],
	    autoWidth: true,
	    sortable: false,
	    tooltip: true
	};
	
	if(grid) {
		grid.destructor();
	}
	
	grid = new dhx.Grid(null, config);
	grid.selection.setCell(grid.data.getItem(grid.data.getId(0)), grid.config.columns[0]);

	grid.events.on("cellClick", (event, value) => {
		if (value.id == "checkBox") {
			if(!event.checkBox) {
				$("#masterCheckbox").prop("checked", false);
			}else{
				let rowsSelected = grid.data.findAll({by:"checkBox", match: true});
				
				if(grid.config.data.length === rowsSelected.length) {
					$("#masterCheckbox").prop("checked", true);
				}
			}
			return false;
		}
		
		if(value.id != "checkBox" && grid.data.getId(0) != "0"){
			contentMainForm.clear("value");
			layout.getCell("boardWrap").hide();
			layout.getCell("boardContentWrap").show();

			contentMainForm.setValue(event);
			
			let attach = "<div class='dhx_form-group  dhx_form-group--inline'>";
			attach += 		'<label for="subject" class="dhx_label " style="width: 80px; max-width: 100%;">'+language.label_content+'</label>';
			attach +=		'<div class="dhx_input__wrapper">';
			attach +=			'<div id="editor"></div>';
			attach +=		'</div>';
			attach +=	'</div>';
			
			contentMainForm.getItem("contentContainer").attachHTML(attach);
			
			let fileList = findContentFile(event.contentId);
			contentMainForm.getItem("attach").setValue(fileList);
			
			contentMainForm.getItem("writeBoard").hide();
			contentMainForm.getItem("updateBoard").show();
			contentMainForm.getItem("deleteBoard").show();
			
			dhx.awaitRedraw().then(() => {
				setWysiwyg(event.content);
			});
		}
    });

	layout.getCell("boardForm").attach(grid);
}

const master_ch = (state) => {
	grid.data.forEach((row) => {
		if(!row.$empty) {
	        grid.data.update(row.id, { "checkBox": state });
	    }
    });
}

const findContentFile = (contentId) => {
	let fileList = [];
	
	$.ajax({
		url: "board/content?contentId="+contentId,
		method: "GET",
		async: false,
		error: (e) => {
			let status = e.status;
			console.log("게시글 파일 불러오기 오류 : " + status);
			errorMessage(language.errorMessage_findContent);
		},
		success: (data) => {
			switch(data.status){
				case 0:
					errorMessage(language.failMessage_findContent);
					break;
				case 1:
					for(var i=0; i<data.payload.length; i++) {
						let file = {
							"id": data.payload[i].fileId
							,"name": data.payload[i].fileName
							,"link": data.payload[i].url
							,"status": "uploaded" 
						};
						
						fileList.push(file);
					}
					break;
			}
		}
	});
	
	return fileList;
}

const settingTreeForm = () => {
	const template = (item) => {
	    let template = "<div class='furence-tree-template-wrap list_item "+ item.id + "'>";
        template += 	"<span id='list_value_"+item.id+"' class='furence-tree-template-value'";
        template +=		" contents-count='"+item.count+"'>" + item.content +"</span>";
       
       	if(item.noticeFlag == "N") {
	        template +=	"<div class='furence-tree-template-button-wrap hoverIcon'>";
	        template +=		"<div class='furence-template-button update' >";
	        template +=			"<img src='image/icon/edit.svg'>";
	        template +=		"</div>";
	        template +=		"<div class='furence-template-button remove'>"
	        template +=			"<img src='image/icon/delete.svg'>";
	        template +=		"</div>";
	        template +=	"</div>";
	    }
	        
        template +="</div>";
	    return template;
	};
	
	if(tree){
		tree.destructor();
	}
	
	tree = new dhx.List(null, {
	    virtual: true,
	    css: "dhx_widget--bordered",
	    id: "category",
	    template: template,
	    itemHeight: 35,
	    eventHandlers: {
	        onmouseover: {
				list_item: (event, id) => {
					$("."+id).find(".hoverIcon").css("display","flex");
				},
			},
			onmouseout: {
				list_item: (event, id) => {
					$("."+id).find(".hoverIcon").hide();
				},
			},
			onclick: {
				furence_list_item: (event, id, value) => {
					if($(event.target).attr("id") === "addCategoryName") {
						return false;
					}
					
					if(layout.getCell("boardContentWrap").isVisible()) {
						// 쓰기, 수정인 경우
						showConfirm(language.confirmTitle_moveBoard, language.confirm_moveBoard, () => {
							contentMainForm.clear("value");
							editor.destruct();
							layout.getCell("boardContentWrap").hide();
							layout.getCell("boardWrap").show();
							
							searchForm.setValue({
								"boardId":id
							});
							loadBoardContents(0);
				        });
					}else{
						searchForm.setValue({
							"boardId":id
						});
						loadBoardContents(0);
					}
				},
				update: (event, id) => {
					if($("#addCategoryName").length > 0){
						$("#addCategoryName").focus();
						errorMessage(language.failMessage_writing);
						return false;
					}
					
					let boardName = $("#list_value_"+id).text();
					
					$(".dhx_list-item[data-dhx-id="+id+"]").css("height","35px");
					$("."+id).remove();
					
					let updateCategoryForm = "";
					updateCategoryForm += "<div class='furence-tree-template-wrap'>";
					updateCategoryForm +=	"<span class='furence-tree-template-value'>";
					updateCategoryForm +=		"<input id='addCategoryName' type='text' maxlength='12'";
					updateCategoryForm +=		" value='" + boardName+ "'>";
					updateCategoryForm +=	"</span>";
					updateCategoryForm +=	"<div class='furence-tree-template-button-wrap'>";
					updateCategoryForm +=		"<div class='furence-template-button close'>";
					updateCategoryForm +=			"<img src='image/icon/close.svg'>";
					updateCategoryForm +=		"</div>";
					updateCategoryForm +=		"<div class='furence-template-button modify'>";
					updateCategoryForm +=			"<img src='image/icon/save.svg'>";
					updateCategoryForm +=		"</div>";
					updateCategoryForm +=	"</div>";
					updateCategoryForm += "</div>";
					
					$(".dhx_list-item[data-dhx-id="+id+"]").append(updateCategoryForm);
					
					$("#addCategoryName").focus();
					
					$("#addCategoryName").on("keydown", (e) => {
						if(e.originalEvent.keyCode == 13) {
							categoryNameEnter(id);
						}
					});
				},
				remove: (event, id, name) => {
					let boardName = $("#list_value_"+id).text();
					let contentsCount = $("#list_value_"+id).attr("contents-count");
					
					if(contentsCount > 0){
						errorMessage(language.failMessage_haveContent);
						return false;
					}
					showConfirm(language.confirmTitle_boardDelete, boardName+language.confirm_deleteBoard, () => {
						deleteBoardCategory(id);
					});
				},
				close: () => {
					settingTreeForm();
				},
				modify: (event, id) => {
					if($("#addCategoryName").val() == "" || $("#addCategoryName").val() == null) {
						errorMessage(language.failMessage_noName);
						layout.getCell("treeForm").progressHide();
						return false;
					}
					updateBoardCategory(id);
				},
				newCancel: () => {
					$(".newCategory").remove();
				},
				newAdd: () => {
					layout.getCell("treeForm").progressShow();
					if($("#addCategoryName").val() == "" || $("#addCategoryName").val() == null) {
						errorMessage(language.failMessage_noName);
						layout.getCell("treeForm").progressHide();
						return false;
					}
					addBoardCategory();
				}
			}
		}
	});
	
	loadBoardCategory();
	tree.data.parse(categoryList);
	
	let categoryId = sessionStorage.getItem("boardId") != null 
			? sessionStorage.getItem("boardId")
			: categoryList[0].id;
			
    tree.setFocus(categoryId);
    dhx.awaitRedraw().then(() => {
	    $(".furence_list_item[data-dhx-id="+categoryId+"]").addClass("dhx_list-item--selected");		
	})
    
    layout.getCell("treeForm").attach(tree);
}

//엔터이벤트
const categoryNameEnter = (value) => {
	if(value != null && value != undefined && value != "") {
		if($("#addCategoryName").val() == "" || $("#addCategoryName").val() == null) {
			errorMessage(language.failMessage_noName);
			layout.getCell("treeForm").progressHide();
			return false;
		}
		updateBoardCategory(value);
	}else{
		layout.getCell("treeForm").progressShow();
		if($("#addCategoryName").val() == "" || $("#addCategoryName").val() == null) {
			errorMessage(language.failMessage_noName);
			layout.getCell("treeForm").progressHide();
			return false;
		}
		addBoardCategory();
	}
}

const loadBoardCategory = (isSelect) => {
	layout.getCell("treeForm").progressShow();
	
	let dataset = [];
	let boardId;
	
	$.ajax({
		url: "board/category?tenantId="+TENANTID,
		method: "get",
		async: false,
		error: (e) => {
			let status = e.status;
			console.log("게시판 목록 조회 오류 : " + status);
			errorMessage(language.errorMessage_findBoard);
		},
		success: (data) => {
			switch(data.status){
				case 0:
					errorMessage(language.failMessage_findBoard);
					break;
				case 1:
					let result = data.payload;
					
					if(isSelect) {
						let noneBoard = {
							"content": language.optionLabel_noneSelect
							,"value": "none"
						};
						
						dataset.push(noneBoard);
					}
					
					for(var i=0; i<result.result.length; i++){
						let root = false;
						
						if(result.result[i].noticeFlag == 'y'){
							root = true
						}
						
						let category = {
							"content": result.result[i].name
							,"value": result.result[i].boardId
							,"id": result.result[i].boardId
							,"noticeFlag": result.result[i].noticeFlag
							,"root": root
							,"count":result.result[i].contentsCount
						};
						
						dataset.push(category);
					}
					
					if(sessionStorage.getItem("boardId") != null) {
						boardId = sessionStorage.getItem("boardId");
					}else{
						boardId = result.result[0].boardId; 						
					}
					
					searchForm.setValue({
						"boardId": boardId
					});
					
					let page = sessionStorage.getItem("page") != null ? sessionStorage.getItem("page") : 0;
					loadBoardContents(page);
					break;
			}
		}
	});
	
	layout.getCell("treeForm").progressHide();
	
	categoryList = dataset;
}

const loadBoardContents = (from) => {
	layout.getCell("boardForm").progressShow();
	$("#masterCheckbox").prop("checked", false);
	
	searchForm.setValue({
	    "from": (GRIDLIMIT*from), 
	    "limit": GRIDLIMIT,
	    "tenantId": TENANTID
	});

	if(pagination != null){
		pagination.destructor();
	}

	$.ajax({
		url: "board/contents",
		method: "get",
		contentType: 'application/json',
		data: searchForm.getValue(),
		async: false,
		error: (e) => {
			let status = e.status;
			console.log("게시글 목록 조회 오류 : " + status);
			errorMessage(language.errorMessage_findContentList);
		},
		success: (data) => {
			
			switch(data.status){
				case 0:
					errorMessage(language.failMessage_findContentList);
					//그리드 로드전에 초기화
					beforeDataGrid(grid);
					
					break;
				case 1:
					if(data.payload.result.total_count === 0) {
						//그리드 로드전에 초기화
						beforeDataGrid(grid);

						dhx.awaitRedraw().then(() => {
							$(".dhx_grid-body").addClass("noneData");							
						});
						
						noneDataGrid(grid);
					}else{
						dhx.awaitRedraw().then(() => {
							grid.getColumn("checkBox").hidden = false;
							grid.data.parse(data.payload.result);
							$(".dhx_grid-body").removeClass("noneData");
						});
					}
					pagination = new dhx.Pagination(null, {
					    css: "pagination dhx_widget--bordered dhx_widget--no-border_top",
					    data: grid.data,
					    pageSize: GRIDLIMIT
					});
					
					layout.getCell("pagination").attach(pagination);
					pagination.setPage(from);
		
					pagination.events.on("change", (index, previousIndex) => {
						loadBoardContents(index);
					});
					break;
			}
			
		}
	});
	
	layout.getCell("boardForm").progressHide();
}

const deleteBoardSelectContents = (boardList) => {
	let data = {
		"tenantId": TENANTID,
		"boardListString": boardList.toString()
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
			switch(data.status){
				case 0:
					errorMessage(language.failMessage_deleteContent);
					break;
				case 1:
					loadBoardContents(pagination._page);				
					message(language.message_successSelectedDelete);
					
					layout.getCell("boardForm").progressHide();
					break;
			}
			
		}
	});
}

const addBoardCategory = () => {
	
	categoryAddButton.setValue({
		"tenantId": TENANTID
		,"creatorId": ADMIN_CREATOR_ID
		,"name": $('#addCategoryName').val()
		,"creatorName": ADMIN_CREATOR_NAME
		,"boardId":0
	});
	
	$.ajax({
			url: "board/category",
			contentType: "application/json",
			data: JSON.stringify(categoryAddButton.getValue()),
			method: "POST",
			async: false,
			error: (e) => {
				let status = e.status;
				console.log('게시판 추가 오류 : ' + status);
				errorMessage(language.errorMessage_addBoard);
			},
			success: (data) => {
				switch(data.status){
					case 0:
						errorMessage(language.failMessage_addBoard);
						break;
					case 1:
						//카테고리 데이터 다시 불러오기
						message(language.message_addBoard)
						settingTreeForm();
						
						contentMainForm.getItem("boardId").config.options = categoryList 
						break;
				}
			}
	});
	
	layout.getCell("treeForm").progressHide();
}

const updateBoardCategory = (boardId) => {
	
	categoryAddButton.setValue({
		"tenantId": TENANTID
		,"creatorId": ADMIN_CREATOR_ID
		,"name": $('#addCategoryName').val()
		,"boardId": boardId
	});
	
	$.ajax({
		url: "board/updateCategory",
		contentType: "application/json",
		data: JSON.stringify(categoryAddButton.getValue()),
		method: "PUT",
		async: false,
		error: (e) => {
			let status = e.status;
			console.log('게시판 수정 오류 : ' + status);
			errorMessage(language.errorMessage_editBoard);
		},
		success: (data) => {
			switch(data.status){
				case 0:
					errorMessage(language.failMessage_editBoard);
					break;
				case 1:
					//카테고리 데이터 다시 불러오기
					message(language.message_editBoard)
					settingTreeForm();
					searchForm.setValue({
						"boardId":id
					});
					
					contentMainForm.getItem("boardId").config.options = categoryList; 
					break;
			}
		}
	});
}

const deleteBoardCategory = (boardId) => {
	let data = {
		"boardId": boardId
		,"tenantId": TENANTID
	};
	
	$.ajax({
		url: "board/category/"+boardId,
		method: "put",
		contentType: 'application/json',
		data: JSON.stringify(data),
		async: false,
		error: (e) => {
			let status = e.status;
			console.log("게시판 삭제 오류 : " + status);
			errorMessage(language.errorMessage_deleteBoard);
		},
		success: (data) => {
			switch(data.status){
				case 0:
					errorMessage(language.failMessage_deleteBoard);
					break;
				case 1:
					message(language.message_deleteBoard);
					settingTreeForm();
					
					contentMainForm.getItem("boardId").config.options = categoryList;
					break;
			}
			
		}
	});
}

const initUploadManage = () => {
	createUploadLayout();
	settingUploadForm();
	settingUploadGrid();
}

const createUploadLayout = () => {
	layout = new dhx.Layout("layout", {
		type: "space",
		css: "contentsTitleWrap",
		cols: [
			{
				id: "C1",
				width: 260,
				padding: 20,
				html: ""
					+ "<div class='dhx_widget dhx_widget--bordered' style='height: 100%; padding: 16px;'>"
					+ 	"<h3 style='margin-top: 0;'>FileTask</h3>"
					+ 	"<div style='display: grid; gap: 8px;'>"
					+ 		"<button id='sidebarUploadButton' class='dhx_button dhx_button--color_primary dhx_button--size_medium' type='button'>업로드</button>"
					+ 		"<button id='sidebarUsersButton' class='dhx_button dhx_button--color_secondary dhx_button--size_medium' type='button'>사용자 조회</button>"
					+ 	"</div>"
					+ "</div>"
			},
			{
				id: "C2",
				gravity: 1,
				html: ""
					+ "<div style='height: 100%; display: flex; flex-direction: column;'>"
					+ 	"<div id='uploadForm' style='padding: 20px;'></div>"
					+ 	"<div id='uploadResult' style='padding: 0 20px 20px;'></div>"
					+ 	"<div id='grid' style='height: 100%; min-height: 360px; padding: 0 20px 20px;'></div>"
					+ "</div>"
			}
		]
	});

	dhx.awaitRedraw().then(() => {
		document.getElementById("sidebarUploadButton").addEventListener("click", () => {
			document.getElementById("uploadFile").click();
		});

		document.getElementById("sidebarUsersButton").addEventListener("click", () => {
			loadUploadUsers();
		});
	});
}

const settingUploadForm = () => {
	const uploadHtml = ""
		+ "<div class='dhx_widget dhx_widget--bordered' style='padding: 16px;'>"
		+ 	"<form id='uploadFormElement' enctype='multipart/form-data'>"
		+ 		"<div class='dhx_form-group dhx_form-group--inline' style='margin-bottom: 12px;'>"
		+ 			"<label class='dhx_label' style='width: 90px;'>파일</label>"
		+ 			"<div class='dhx_input__wrapper'>"
		+ 				"<input id='uploadFile' name='file' type='file' accept='.dbfile' required>"
		+ 			"</div>"
		+ 		"</div>"
		+ 		"<div class='dhx_form-group dhx_form-group--inline' style='margin-bottom: 12px;'>"
		+ 			"<label class='dhx_label' style='width: 90px;'>중복</label>"
		+ 			"<label style='display: inline-flex; align-items: center; gap: 6px;'>"
		+ 				"<input id='uploadForce' name='force' type='checkbox' value='true'>"
		+ 				"중복 업로드 진행"
		+ 			"</label>"
		+ 		"</div>"
		+ 		"<div style='display: flex; gap: 8px; padding-left: 90px;'>"
		+ 			"<button id='uploadSubmit' class='dhx_button dhx_button--color_primary dhx_button--size_medium' type='submit'>업로드</button>"
		+ 			"<button id='loadUsersButton' class='dhx_button dhx_button--color_secondary dhx_button--size_medium' type='button'>조회</button>"
		+ 		"</div>"
		+ 	"</form>"
		+ 	"<div style='display: flex; align-items: center; gap: 8px; margin-top: 14px; padding-left: 90px;'>"
		+ 		"<input id='userFilterWord' class='dhx_input' type='text' placeholder='NAME 필터' style='width: 180px;'>"
		+ 		"<button id='applyUserFilterButton' class='dhx_button dhx_button--color_secondary dhx_button--size_medium' type='button'>Apply filter</button>"
		+ 		"<button id='resetUserFilterButton' class='dhx_button dhx_button--color_secondary dhx_button--size_medium' type='button'>Reset filter</button>"
		+ 	"</div>"
		+ "</div>";

	dhx.awaitRedraw().then(() => {
		document.getElementById("uploadForm").innerHTML = uploadHtml;

		document.getElementById("uploadFormElement").addEventListener("submit", (event) => {
			event.preventDefault();
			uploadDbFile();
		});
	
		document.getElementById("loadUsersButton").addEventListener("click", () => {
			loadUploadUsers();
		});

		document.getElementById("applyUserFilterButton").addEventListener("click", () => {
			applyFilter();
		});

		document.getElementById("resetUserFilterButton").addEventListener("click", () => {
			resetFilter();
		});

		document.getElementById("userFilterWord").addEventListener("keydown", (event) => {
			if(event.key === "Enter") {
				applyFilter();
			}
		});
	});
}

const settingUploadGrid = () => {
	const config = {
		columns: [
			{ id: "id", header: [{ text: "ID", align: "center" }], align: "left" },
			{ id: "pwd", header: [{ text: "PWD", align: "center" }], align: "left" },
			{ id: "name", header: [{ text: "NAME", align: "center" }], align: "left" },
			{ id: "level", header: [{ text: "LEVEL", align: "center" }], align: "right", maxWidth: 120 },
			{ id: "desc", header: [{ text: "DESC", align: "center" }], align: "left" },
			{ id: "regDateText", header: [{ text: "REG_DATE", align: "center" }], align: "right", maxWidth: 220 }
		],
		autoWidth: true,
		sortable: false,
		tooltip: true
	};

	if(grid) {
		grid.destructor();
	}

	dhx.awaitRedraw().then(() => {
		grid = new dhx.Grid("grid", config);
	});
}

const uploadDbFile = () => {
	const fileInput = document.getElementById("uploadFile");

	if(!fileInput.files || fileInput.files.length === 0) {
		renderUploadResult("파일을 선택해주세요.");
		return false;
	}

	layout.getCell("C2").progressShow();

	const formData = new FormData();
	formData.append("file", fileInput.files[0]);
	formData.append("force", document.getElementById("uploadForce").checked);

	fetch("users/upload", {
		method: "POST",
		body: formData
	})
		.then((response) => {
			if(!response.ok) {
				throw new Error("upload failed");
			}
			return response.json();
		})
		.then((result) => {
			renderUploadResult(createUploadResultHtml(result));
			if(result.successCount != null) {
				loadUploadUsers();
			}
		})
		.catch(() => {
			renderUploadResult("업로드 중 오류가 발생했습니다.");
		})
		.finally(() => {
			layout.getCell("C2").progressHide();
		});
}

const loadUploadUsers = () => {
	layout.getCell("C2").progressShow();

	fetch("users")
		.then((response) => {
			if(!response.ok) {
				throw new Error("load users failed");
			}
			return response.json();
		})
		.then((users) => {
			const dataset = users.map((user) => ({
				id: user.id,
				pwd: user.pwd,
				name: user.name,
				level: user.level,
				desc: user.desc || "",
				regDateText: formatUploadRegDate(user.regDate)
			}));

			grid.data.removeAll();
			grid.data.parse(dataset);
		})
		.catch(() => {
			renderUploadResult("조회 중 오류가 발생했습니다.");
		})
		.finally(() => {
			layout.getCell("C2").progressHide();
	});
}

const applyFilter = () => {
	const filterWord = document.getElementById("userFilterWord").value.trim();

	if(filterWord === "") {
		grid.data.filter();
		return false;
	}

	grid.data.filter({by: "id", match: filterWord, compare: (value, match) => {
			return String(value || "").toLowerCase().includes(String(match).toLowerCase());
		}
	});
}

const resetFilter = () => {
	document.getElementById("userFilterWord").value = "";
	grid.data.filter();
}

const createUploadResultHtml = (result) => {
	if(result.successCount == null) {
		return ""
			+ "<p>" + (result.message || "") + "</p>"
			+ "<p>파일명: " + (result.fileName || "") + "</p>"
			+ "<p>남은 시간: " + (result.ttlSeconds || "") + "초</p>";
	}

	let html = ""
		+ "<p>파일명: " + (result.fileName || "") + "</p>";

	if(result.failCount === 0) {
		html += ""
			+ "<p>전체 성공</p>"
			+ "<p>" + result.successCount + "건 입력 성공</p>";
	}else{
		html += ""
			+ "<p>전체/일부 실패</p>"
			+ "<p>성공 " + result.successCount + "건 실패 " + result.failCount + "건</p>";

		if(result.failList && result.failList.length > 0) {
			html += "<p>실패 라인</p><ul>";
			result.failList.forEach((fail) => {
				html += "<li>" + fail + "</li>";
			});
			html += "</ul>";
		}
	}

	return html;
}

const renderUploadResult = (content) => {
	const html = ""
		+ "<div class='dhx_widget dhx_widget--bordered' style='padding: 16px; margin-top: 12px;'>"
		+ 	"<h3 style='margin-top: 0;'>업로드 결과</h3>"
		+ 	content
		+ "</div>";

	document.getElementById("uploadResult").innerHTML = html;
}

const formatUploadRegDate = (regDate) => {
	if(!regDate) {
		return "";
	}

	const date = new Date(regDate);

	if(Number.isNaN(date.getTime())) {
		return regDate;
	}

	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const hour = String(date.getHours()).padStart(2, "0");
	const minute = String(date.getMinutes()).padStart(2, "0");

	return year + "년 " + month + "월 " + day + "일 " + hour + "시 " + minute + "분";
}
