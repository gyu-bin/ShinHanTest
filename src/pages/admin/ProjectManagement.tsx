import React, { useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination, IconButton, Menu, MenuItem,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import MoreVertIcon from "@mui/icons-material/MoreVert";

const PAGE_SIZE = 10;

type ProjectItem = {
  project: {
    id: string;
    name: string;
  };
  namespace: {
    id: string;
    status: string | null;
    cpu_quota: string | null;
    mem_quota: string | null;
    gpu_quota: string | null;
    creator: string;
    created_at: string;
    modified_at: string | null;
  };
};

type ProjectResponse = {
  data: ProjectItem[];
  payload: {
    pagination: {
      page: number;
      total: number;
      last_page: number;
    };
  };
};

const ProjectManagement: React.FC = () => {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { get, delete: del } = useApi();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const fetchProjects = async (page: number): Promise<ProjectResponse> => {
    return get<ProjectResponse>(`/projects?page=${page}&size=${PAGE_SIZE}`);
  };

  const { data, isLoading } = useQuery<ProjectResponse, Error>({
    queryKey: ['projects', page],
    queryFn: () => fetchProjects(page),
    placeholderData: (prev) => prev,
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, projectId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedProjectId(projectId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProjectId(null);
  };

  const handleDelete = async () => {
    if (!selectedProjectId) return;

    try {
      await del(`/projects/${selectedProjectId}`);
      await queryClient.invalidateQueries({ queryKey: ['projects', page] }); // ✅ 수정된 부분
    } catch (error) {
      console.error('프로젝트 삭제 실패:', error);
    } finally {
      handleMenuClose();
    }
  };

  const projects = data?.data ?? [];
  const totalPages = data?.payload.pagination.last_page ?? 1;

  return (
      <Box>
        <Typography variant="h5" fontWeight={700} mb={1}>프로젝트 관리</Typography>
        <Typography color="text.secondary" mb={3} fontSize={15}>
          프로젝트를 관리하고 설정을 변경할 수 있습니다.
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          {/*<Button variant="contained" size="small">신규</Button>*/}
          <TextField size="small" placeholder="프로젝트명 입력" />
        </Box>

        <Paper elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
          {isLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                <CircularProgress />
              </Box>
          ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f4f6f8' }}>
                        <TableCell>프로젝트명</TableCell>
                        <TableCell>상태</TableCell>
                        <TableCell>CPU Quota</TableCell>
                        <TableCell>MEM Quota</TableCell>
                        <TableCell>GPU Quota</TableCell>
                        <TableCell>최종업데이트</TableCell>
                        <TableCell>삭제</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {projects.map((item) => {
                        const projectName = item.project.name;
                        const status = projectName === '테스트' ? '보류' : '진행중'; // 🔧 하드코딩

                        return (
                            <TableRow
                                key={item.project.id}
                                hover
                                sx={{ cursor: 'pointer' }}
                                onClick={() => navigate(`/admin/projects/${item.project.id}`)}
                            >
                              <TableCell>{projectName}</TableCell>
                              <TableCell>{status}</TableCell>
                              <TableCell>{item.namespace.cpu_quota ?? '-'}</TableCell>
                              <TableCell>{item.namespace.mem_quota ?? '-'}</TableCell>
                              <TableCell>{item.namespace.gpu_quota ?? '-'}</TableCell>
                              <TableCell>
                                {item.namespace.modified_at
                                    ? new Date(item.namespace.modified_at).toLocaleDateString()
                                    : '-'}
                              </TableCell>
                              <TableCell>
                                <IconButton
                                    onClick={(e) => {
                                      e.stopPropagation(); // ✅ 상세페이지로 가는 Row 클릭 막기
                                      handleMenuOpen(e, item.project.id);
                                    }}
                                >
                                  <MoreVertIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    onClick={(e) => e.stopPropagation()} // ✅ Menu 내부 클릭 시 Row 클릭 막기
                >
                  <MenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                      }}
                  >
                    삭제
                  </MenuItem>
                </Menu>

                <Box display="flex" justifyContent="center" my={2}>
                  <Pagination
                      count={totalPages}
                      page={page}
                      onChange={(_, value) => setPage(value)}
                      shape="rounded"
                  />
                </Box>
              </>
          )}
        </Paper>
      </Box>
  );
};

export default ProjectManagement;