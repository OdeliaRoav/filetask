<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
    <%@include file="../common/include.jsp" %>

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
