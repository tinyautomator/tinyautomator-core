package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	null "github.com/guregu/null/v6"
	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/config"
	"github.com/tinyautomator/tinyautomator-core/backend/db/dao"
	repo "github.com/tinyautomator/tinyautomator-core/backend/repositories"
)

type WorkflowController interface {
	GetWorkflow(ctx *gin.Context)
	CreateWorkflow(ctx *gin.Context)
	GetWorkflowRender(ctx *gin.Context)
}

type workflowController struct {
	log  *logrus.Logger
	repo repo.WorkflowRepository
}

type CreateWorkflowRequest struct {
	Name  string              `json:"name"`
	Nodes []WorkflowNodeInput `json:"nodes"`
	Edges []WorkflowEdgeInput `json:"edges"`
}

type WorkflowNodeInput struct {
	ID       string `json:"id"`
	Type     string `json:"type"`
	Position struct {
		X float64 `json:"x"`
		Y float64 `json:"y"`
	} `json:"position"`
	Data struct {
		Label    string `json:"label"`
		Category string `json:"category"`
	} `json:"data"`
}

type WorkflowEdgeInput struct {
	ID     string `json:"id"`
	Source string `json:"source"`
	Target string `json:"target"`
}

func NewWorkflowController(cfg config.AppConfig) *workflowController {
	return &workflowController{
		log:  cfg.GetLogger(),
		repo: cfg.GetWorkflowRepository(),
	}
}

func (c *workflowController) GetWorkflow(ctx *gin.Context) {
	idStr := ctx.Param("id")

	id, err := strconv.Atoi(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})

		return
	}

	workflow, err := c.repo.GetWorkflow(ctx.Request.Context(), int64(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "workflow not found"})

		return
	}

	ctx.JSON(http.StatusOK, workflow)
}

func (c *workflowController) CreateWorkflow(ctx *gin.Context) {
	var req CreateWorkflowRequest
	if err := ctx.BindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	workflow, err := c.repo.CreateWorkflow(ctx.Request.Context(), &dao.CreateWorkflowParams{
		Name:        req.Name,
		Description: null.NewString("", false),
		UserID:      "test-user",
	})
	if err != nil {
		c.log.Errorf("Workflow insert error: %v", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create workflow"})

		return
	}

	nodeIdMap := make(map[string]int64, len(req.Nodes))

	for _, n := range req.Nodes {
		node, err := c.repo.CreateWorkflowNode(ctx.Request.Context(), &dao.CreateWorkflowNodeParams{
			WorkflowID: workflow.ID,
			Name:       null.StringFrom(n.Data.Label),
			Type:       n.Type,
			Category:   n.Data.Category,
			Service:    null.NewString("", false),
			Config:     "{}",
		})
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to insert node"})
			return
		}

		nodeIdMap[n.ID] = node.ID

		_, err = c.repo.CreateWorkflowNodeUi(ctx.Request.Context(), &dao.CreateWorkflowNodeUiParams{
			ID:         node.ID,
			WorkflowID: workflow.ID,
			XPosition:  n.Position.X,
			YPosition:  n.Position.Y,
			NodeLabel:  null.StringFrom(n.Data.Label),
			NodeType:   n.Type,
		})
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to insert node UI"})
			return
		}
	}

	for _, e := range req.Edges {
		fromID, ok1 := nodeIdMap[e.Source]
		toID, ok2 := nodeIdMap[e.Target]

		if !ok1 || !ok2 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid edge reference"})
			return
		}

		_, err := c.repo.CreateWorkflowEdge(ctx.Request.Context(), &dao.CreateWorkflowEdgeParams{
			WorkflowID:   workflow.ID,
			SourceNodeID: fromID,
			TargetNodeID: toID,
		})
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to insert edge"})
			return
		}
	}

	ctx.JSON(http.StatusCreated, gin.H{"id": workflow.ID})
}

func (c *workflowController) GetWorkflowRender(ctx *gin.Context) {
}
