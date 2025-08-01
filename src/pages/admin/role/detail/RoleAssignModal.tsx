import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Slide,
  Pagination,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { TransitionProps } from "@mui/material/transitions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../../../../hooks/useApi";

interface RoleAssignModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

interface RoleItem {
  role: { id: string; name: string; description?: string };
  project: { id: string; name: string };
}

interface RoleApiResponse {
  data: RoleItem[];
  pagination: {
    page: number;
    last_page: number;
    total: number;
  };
}

const PAGE_SIZE = 50;

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const RoleAssignModal: React.FC<RoleAssignModalProps> = ({
  open,
  onClose,
  userId,
}) => {
  const { get, put } = useApi();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<RoleItem[]>([]);
  const [page, setPage] = useState(1);

  const {
    data: roleData,
    isLoading,
    isError,
  } = useQuery<RoleApiResponse, Error>({
    queryKey: ["roleAvailable", userId, page],
    queryFn: async () => {
      return await get<RoleApiResponse>(
        `/users/${userId}/role-available?page=${page}&size=${PAGE_SIZE}`,
      );
    },
    staleTime: 1000 * 30,
  });

  const totalPages = roleData?.pagination?.last_page ?? 1;

  const handleToggle = (item: RoleItem) => {
    setSelected((prev) => {
      const exists = prev.find(
        (i) => i.role.id === item.role.id && i.project.id === item.project.id,
      );
      return exists
        ? prev.filter(
            (i) =>
              !(i.role.id === item.role.id && i.project.id === item.project.id),
          )
        : [...prev, item];
    });
  };

  const assignRoles = useMutation({
    mutationFn: () => put(`/users/${userId}/role-mappings`, selected),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userRoleMappings", userId] });
      onClose();
    },
    onError: () => alert("역할 할당에 실패했습니다."),
  });

  const filteredData =
    roleData?.data.filter(
      (item) =>
        item.role.name.toLowerCase().includes(search.toLowerCase()) ||
        item.project.name.toLowerCase().includes(search.toLowerCase()),
    ) || [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          width: "50vw",
          height: "90vh",
          position: "fixed",
          right: 0,
          m: 0,
          borderRadius: 0,
        },
      }}
    >
      <DialogTitle>
        역할 할당하기
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <Typography variant="body2" mb={2}>
          사용자에게 할당하고자 하는 역할을 선택해주세요.
        </Typography>

        <TextField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          placeholder="역할 또는 프로젝트 이름 검색"
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Box flex={1} overflow="auto">
          {isLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : isError ? (
            <Alert severity="error">
              할당 가능한 역할을 불러오는데 실패했습니다.
            </Alert>
          ) : (
            <>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox"></TableCell>
                    <TableCell>NO</TableCell>
                    <TableCell>역할명</TableCell>
                    <TableCell>유형</TableCell>
                    <TableCell>설명</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.map((item, idx) => (
                    <TableRow key={`${item.role.id}-${item.project.id}`}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selected.some(
                            (i) =>
                              i.role.id === item.role.id &&
                              i.project.id === item.project.id,
                          )}
                          onChange={() => handleToggle(item)}
                        />
                      </TableCell>
                      <TableCell>{(page - 1) * PAGE_SIZE + idx + 1}</TableCell>
                      <TableCell>{item.role.name}</TableCell>
                      <TableCell>{item.project.name}</TableCell>
                      <TableCell>{item.role.description ?? "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Box mt={2} display="flex" justifyContent="center">
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  shape="rounded"
                  showFirstButton
                  showLastButton
                />
              </Box>
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "flex-start", px: 3, pb: 2 }}>
        <Button onClick={onClose}>취소</Button>
        <Button
          variant="contained"
          disabled={selected.length === 0 || assignRoles.isPending}
          onClick={() => assignRoles.mutate()}
        >
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoleAssignModal;
