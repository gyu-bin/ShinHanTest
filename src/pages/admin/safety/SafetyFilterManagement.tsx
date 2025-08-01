import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../../../hooks/useApi";
import SafetyFilterCreateDrawer from "./detail/SafetyFilterCreateDrawer";
import MoreVertIcon from "@mui/icons-material/MoreVert";

type SafetyFilter = {
  id: string;
  stopword: string;
  label: string;
  category: string;
  status: string;
  updated_at: string;
  project_id: string;
};

const SafetyFilterManagement: React.FC = () => {
  const navigate = useNavigate();
  const { get, delete: deleteApi, token } = useApi();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchFilters = async (): Promise<SafetyFilter[]> => {
    const res = await get<{ data: SafetyFilter[] }>(
      "/safety-filters?page=1&size=12&sort=updated_at,desc",
    );
    return res.data;
  };

  const { data, isLoading } = useQuery({
    queryKey: ["safetyFilters"],
    queryFn: fetchFilters,
    enabled: !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteApi(`/safety-filters/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["safetyFilters"] });
    },
  });

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    id: string,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedId(null);
  };

  const handleDelete = () => {
    if (selectedId) {
      deleteMutation.mutate(selectedId);
    }
    handleMenuClose();
  };

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={700}>
        세이프티 필터 관리
      </Typography>
      <Box display="flex" justifyContent="flex-end" mt={2} mb={2}>
        <Button variant="contained" onClick={() => setOpen(true)}>
          새 규칙 만들기
        </Button>
        <SafetyFilterCreateDrawer open={open} onClose={() => setOpen(false)} />
      </Box>

      <Paper>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>금지어</TableCell>
                  <TableCell>상태</TableCell>
                  <TableCell>프로젝트명</TableCell>
                  <TableCell>라벨</TableCell>
                  <TableCell>분류</TableCell>
                  <TableCell>최종업데이트</TableCell>
                  <TableCell align="right"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.map((filter) => (
                  <TableRow
                    key={filter.id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() =>
                      navigate(`/admin/safety-filters/${filter.id}`)
                    }
                  >
                    <TableCell>{filter.stopword}</TableCell>
                    <TableCell>{filter.status}</TableCell>
                    <TableCell>{filter.project_id}</TableCell>
                    <TableCell>{filter.label}</TableCell>
                    <TableCell>{filter.category}</TableCell>
                    <TableCell>{filter.updated_at}</TableCell>
                    <TableCell
                      align="right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <IconButton
                        onClick={(e) => handleMenuClick(e, filter.id)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDelete}>삭제</MenuItem>
      </Menu>
    </Box>
  );
};

export default SafetyFilterManagement;
