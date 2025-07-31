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
  Pagination,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import GroupCreateDrawer from '../admin/userDetail/GroupCreateModal';

const PAGE_SIZE = 12;

type Group = {
  id: string;
  name: string;
  description: string | null;
  member_count: number;
  created_at: string;
  updated_at: string; // 최종업데이트용 (임시라도 필요)
};

type GroupResponse = {
  data: Group[];
  payload: {
    pagination: {
      page: number;
      total: number;
      last_page: number;
    };
  };
};

const GroupManagement: React.FC = () => {
  const [page, setPage] = useState(1);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuGroupId, setMenuGroupId] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();
  const { get,delete: deleteApi } = useApi();
  const queryClient = useQueryClient();
  const fetchGroups = async (page: number): Promise<GroupResponse> => {
    return get<GroupResponse>(`/groups?page=${page}&size=${PAGE_SIZE}`);
  };

  const { data, isLoading } = useQuery<GroupResponse, Error>({
    queryKey: ['groups', page],
    queryFn: () => fetchGroups(page),
    placeholderData: (prev) => prev,
  });

  const groups = data?.data ?? [];
  const totalPages = data?.payload.pagination.last_page ?? 1;

  const handleMenuOpen = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    setAnchorEl(e.currentTarget);
    setMenuGroupId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuGroupId(null);
  };


  const deleteGroup = useMutation({
    mutationFn: (groupId: string) => deleteApi(`/groups/${groupId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      alert('그룹이 삭제되었습니다.');
    },
    onError: () => {
      alert('삭제에 실패했습니다.');
    },
  });

// 삭제 핸들러
  const handleDelete = () => {
    if (window.confirm('정말로 삭제하시겠습니까?')) {
      if (menuGroupId) {
        deleteGroup.mutate(menuGroupId);
      }
    }
    handleMenuClose();
  };

  return (
      <Box>
        <Typography variant="h5" fontWeight={700} mb={1}>그룹 관리</Typography>
        <Typography color="text.secondary" mb={3} fontSize={15}>
          사용자 그룹을 관리하고 멤버를 설정할 수 있습니다.
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Button variant="contained" size="small" onClick={() => setOpenModal(true)}>새 그룹 만들기</Button>
          <TextField size="small" placeholder="그룹명 입력" />
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
                        <TableCell>No</TableCell>
                        <TableCell>그룹명</TableCell>
                        <TableCell>그룹 설명</TableCell>
                        <TableCell>최종 업데이트</TableCell>
                        <TableCell align="center"></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {groups.map((group, idx) => (
                          <TableRow
                              key={group.id}
                              hover
                              sx={{ cursor: 'pointer' }}
                              onClick={() => navigate(`/admin/groups/${group.id}`)}
                          >
                            <TableCell>{idx + 1}</TableCell>
                            <TableCell>{group.name}</TableCell>
                            <TableCell>{group.description ?? '-'}</TableCell>
                            <TableCell>{new Date(Date.now() - Math.random() * 1e10).toLocaleDateString()}</TableCell>
                            <TableCell align="center">
                              <IconButton
                                  onClick={(e) => {
                                    e.stopPropagation(); // ✅ navigate 방지
                                    handleMenuOpen(e, group.id);
                                  }}
                              >
                                <MoreVertIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                  <MenuItem onClick={handleDelete}>삭제</MenuItem>
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

        <GroupCreateDrawer open={openModal} onClose={() => setOpenModal(false)} />
      </Box>
  );
};

export default GroupManagement;