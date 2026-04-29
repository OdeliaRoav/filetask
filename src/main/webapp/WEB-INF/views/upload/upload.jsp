<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
    <link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/dhtmlx8/codebase/suite.css">
    <link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/css/custom_suite.css">
    <link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/css/board/board.css">

    <script src="${pageContext.request.contextPath}/webjars/jquery/3.6.2/jquery.js"></script>
    <script src="${pageContext.request.contextPath}/dhtmlx8/codebase/suite.js"></script>
    <script src="${pageContext.request.contextPath}/js/board/board.js"></script>

    <title>FileTask</title>
    <script type="text/javascript" src="js/board/board.js"></script>

    <script type="text/javascript">
        language = ${empty language ? 0 : language};
    </script>
    </head>

    <body onload ="boardManager()">

    <div id="layout" style="height: 100%;"></div>

    </body>
    </html>
