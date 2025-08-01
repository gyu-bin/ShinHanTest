import React, { useEffect, useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Divider,
  CircularProgress,
  Button,
  Drawer,
  TextField,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "../../../../hooks/useApi";
import MemberInfoTab from "./MemberInfoTab";

const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { get, put, delete: deleteApi } = useApi();
  const [tabIndex, setTabIndex] = useState(0);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;
      try {
        const res: any = await get(`/projects/${projectId}`);
        setData(res);
        setEditName(res.project.name);
        setEditDesc(res.namespace.description ?? "");
      } catch (err) {
        console.error("프로젝트 정보를 불러오는 데 실패했습니다.", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  const handleSave = async () => {
    if (!projectId) return;
    try {
      await put(`/projects/${projectId}`, {
        name: editName,
        description: editDesc,
      });
      const updated = await get(`/projects/${projectId}`);
      setData(updated);
      setDrawerOpen(false);
    } catch (err) {
      console.error("수정 실패", err);
    }
  };

  const handleDelete = async () => {
    if (!projectId) return;
    try {
      await deleteApi(`/projects/${projectId}`);
      navigate("/admin/projects");
    } catch (err) {
      console.error("삭제 실패", err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <Typography color="error">
          프로젝트 정보를 불러올 수 없습니다.
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={700}>
        프로젝트 상세
      </Typography>
      <Typography mt={1}>
        <b style={{ color: "#2b60d9" }}>'{data.project?.name}'</b> 프로젝트의
        정보를 확인할 수 있습니다.
      </Typography>

      <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mt: 3 }}>
        <Tab label="기본정보" />
        <Tab label="구성원정보" />
        <Tab label="역할정보" />
        <Tab label="자원현황" />
      </Tabs>

      <Divider sx={{ mb: 3 }} />

      {tabIndex === 0 && (
        <Box>
          <Typography variant="subtitle2" mb={1}>
            기본정보
          </Typography>
          <Box border={1} borderColor="#eee" p={2} borderRadius={2}>
            <Typography>
              <b>프로젝트명:</b> {data.project.name}
            </Typography>
            <Typography>
              <b>설명:</b> {data.namespace.description ?? "-"}
            </Typography>
            <Typography>
              <b>생성자:</b> {data.namespace.creator}
            </Typography>
          </Box>

          <Typography variant="subtitle2" mt={4} mb={1}>
            등록정보
          </Typography>
          <Box border={1} borderColor="#eee" p={2} borderRadius={2}>
            <Typography>
              <b>생성일시:</b>{" "}
              {new Date(data.namespace.created_at).toLocaleString()}
            </Typography>
            <Typography>
              <b>최종수정일시:</b>{" "}
              {data.namespace.modified_at
                ? new Date(data.namespace.modified_at).toLocaleString()
                : "-"}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="center" gap={1} mt={3}>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setConfirmOpen(true)}
            >
              삭제
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setDrawerOpen(true)}
            >
              수정
            </Button>
          </Box>
        </Box>
      )}

      {tabIndex === 1 && <MemberInfoTab />}
      {tabIndex === 2 && (
        <Typography>역할 정보 탭 (projectId: {projectId})</Typography>
      )}
      {tabIndex === 3 && (
        <Typography>자원 현황 탭 (projectId: {projectId})</Typography>
      )}

      {/* 수정 Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: "50vw",
            p: 4,
            display: "grid",
            top: "64px", // AppBar 높이만큼 내림
            left: "auto",
            right: 0,
            height: "calc(100vh - 64px)", // AppBar 아래만 덮음
            zIndex: 1200, // AppBar(1201)보다 낮게
            position: "fixed",
            gridTemplateColumns: "160px 1fr",
            gap: 3,
          },
        }}
      >
        {/* 왼쪽 버튼 영역 */}
        <Box>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mb: 1 }}
            onClick={handleSave}
          >
            저장
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => setDrawerOpen(false)}
          >
            취소
          </Button>
        </Box>

        {/* 오른쪽 입력 폼 영역 */}
        <Box>
          <Typography variant="h6" fontWeight={700} mb={1}>
            기본정보 수정
          </Typography>
          <Typography color="text.secondary" fontSize={14} mb={3}>
            프로젝트 기본 정보를 설정해 주세요.
          </Typography>

          <TextField
            fullWidth
            label="프로젝트명"
            required
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            label="설명"
            multiline
            rows={4}
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            helperText={`${editDesc.length}자/50자`}
          />
        </Box>
      </Drawer>

      {/* 삭제 확인 Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>정말 삭제하시겠습니까?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>취소</Button>
          <Button color="error" onClick={handleDelete}>
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectDetailPage;
